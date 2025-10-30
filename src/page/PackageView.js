/*
 * 打包 界面
 * @Author: 康乐 yuankangle@gmail.com
 * @Date: 2022-10-21 16:37:25
 * @LastEditors: 康乐 yuankangle@gmail.com
 * @LastEditTime: 2024-07-11 15:17:21
 * @FilePath: \RN-MultiBundler-UI\src\page\PackageView.js
 * @Description: 打包工具
 */
const {
  Button,
  Checkbox,
  Input,
  Radio,
  Modal,
  Dropdown,
  Space,
  Menu,
  message,
  Drawer,
  Table,
} = require("antd");
const CheckboxGroup = Checkbox.Group;
const { remote, app } = require("electron");
const { exec } = require("child_process");
import React, { useState, useEffect, useRef } from "react";
import { DownOutlined } from "@ant-design/icons";
const path = require("path");
const JSZIP = require("jszip");
const fs = require("fs");
var _ = require("lodash");
const { TextArea } = Input;
const packageLockFileName = "package-lock.json";
// const packageLockFileName = 'yarn.lock';
const packageFileName = "package.json";
import { workSpace } from "../config";
import WinExec from "../utils/WinExec";
const curBinDirName = workSpace || __dirname;
let versionInput = null;
let bundleNameInput = null;
let entrys = [];
let projDir = curBinDirName;
let packageJsonFile = path.join(projDir, packageFileName);
let packageLockFile = path.join(projDir, packageLockFileName);

export default function PackageView(props) {
  const sysItems = [
    { label: "prs", key: "0", id: 2 },
    { label: "ots", key: "1", id: 1 },
    { label: "ops", key: "2" },
    { label: "cims", key: "3", id: 4 },
    { label: "rms", key: "4", id: 5 },
    { label: "cis", key: "5", id: 7 },
    { label: "dts", key: "6", id: 3 },
    { label: "sims", key: "7" },
    { label: "config", key: "8", id: 9 },
    { label: "inboundSorting", key: "9", id: 10 },
    { label: "outbound", key: "10", id: 11 },
    { label: "warehouseQuery", key: "11", id: 12 },
    { label: "allocation", key: "12", id: 13 },
    { label: "delivery", key: "13", id: 14 },
    { label: "audit", key: "14", id: 15 },
    { label: "riskControl", key: "15", id: 16 },
    { label: "abnormal", key: "16", id: 17 },
    { label: "fba", key: "17", id: 18 },
  ];

  const channelItems = [
    {
      label: "YT",
      key: "0",
      cmd: "assembleYTRelease",
      dir: "\\android\\app\\build\\outputs\\apk\\YT\\release",
    },
    {
      label: "FWS",
      key: "1",
      cmd: "assembleFWSRelease",
      dir: "\\android\\app\\build\\outputs\\apk\\FWS\\release",
    },
    {
      label: "YT-DEBUG",
      key: "2",
      cmd: "assembleYTDebug",
      dir: "\\android\\app\\build\\outputs\\apk\\YT\\debug",
    },
    {
      label: "FWS-DEBUG",
      key: "3",
      cmd: "assembleFWSDebug",
      dir: "\\android\\app\\build\\outputs\\apk\\FWS\\debug",
    },
    { label: "Clean", key: "4", cmd: "clean build", dir: "\\android\\app" },
  ];

  const menu = (
    <Menu
      selectable
      onClick={(e) => {
        if (e && e.key && sysItems[e.key] && sysItems[e.key].label) {
          setSelectedSys(sysItems[e.key]);
        }
      }}
      items={sysItems}
    />
  );
  const channel = (
    <Menu
      selectable
      onClick={(e) => {
        if (e.key && channelItems[e.key] && channelItems[e.key].label) {
          setSelectedChannel(channelItems[e.key]);
          setPackageStaus(0);
        }
      }}
      items={channelItems}
    />
  );
  const entryIndexRef = useRef(0);
  const logTextRef = useRef();
  const stateRef = useRef({ type: "base", isAddI18n: true });
  const [entryIndex, setEntryIndex] = useState(0);
  const [platform, setPlatform] = useState("android"); //平台 android iOS
  const [env, setEnv] = useState("false"); //环境 release debug
  const [entry, setEntry] = useState(null); //打包入口
  const [bundleDir, setBundleDir] = useState(null); //打包后bundle目录
  const [bundleName, setBundleName] = useState(null); //bundle名
  const [assetsDir, setAssetsDir] = useState(null); //asset目录
  const [deps, setDeps] = useState([]);
  const [depsChecked, setDepsChecked] = useState([]);
  const [cmdStr, setCmdStr] = useState("");
  const [cmd, setCmd] = useState("");
  const [loading, setLoading] = useState(false);
  const [entryErrorIndex, setEntryErrorIndex] = useState(0);
  const [entryErrorIndexs, setEntryErrorIndexs] = useState([]);
  const [visible, setVisible] = useState(false);
  const [selectedSys, setSelectedSys] = useState(undefined);
  const [selectedChannel, setSelectedChannel] = useState(channelItems[0]);
  const [packageStaus, setPackageStaus] = useState(0);
  const [modleName, setModleName] = useState("");
  const [modlePermission, setModlePermission] = useState("");
  const [open, setOpen] = useState(false);
  const [isUploadPremission, setUploadPremission] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    require("electron").ipcRenderer.on("ExePath", (event, exePath) => {
      try {
        console.log("ExePath-------------->" + exePath);
        //拼接好安装目录下的config.json
        let configPath = `${exePath}/config.json`;
        //使用fs读取文件内容
        const fs = require("fs");
        fs.readFile(configPath, "utf-8", (err, data) => {
          if (data) {
            //注意要转换json
            const config = JSON.parse(data);
            if (config) {
              if (config.dir) {
                console.log("config-------------->" + config.dir);
                projDir = config.dir;
                initDir(projDir);
              }
              if (config.permission) {
                setUploadPremission(Number(config.permission) >= 4);
              }
            }
          }
        });
      } catch (error) {
        error && console.log(error);
      }
    });
    require("electron").ipcRenderer.on("changeDir", (event, value) => {
      // event.sender.send('counter-value', newValue)
      // console.log('==================' + event, value)
      projDir = value;
      message.info("--修改项目根目录为：" + projDir);
      // packageJsonFile = path.join(projDir, packageFileName)
      // packageLockFile = path.join(projDir, packageLockFileName);
      // if (stateRef.current.type == 'base') {
      //     setEntry(projDir + path.sep + 'platformDep-ui.js')
      // } else {
      //     setEntry('')
      // }
      // setAssetsDir(projDir + path.sep + 'android\\app\\src\\main\\res')
      // setBundleDir(projDir + path.sep + 'android\\app\\src\\main\\assets')
      initDir(projDir);
    });
    initDir(projDir);
    return () => {
      if (require("electron") && require("electron").ipcRenderer) {
        require("electron").ipcRenderer.removeAllListeners("ExePath");
        require("electron").ipcRenderer.removeAllListeners("changeDir");
      }
    };
  }, []);

  let initDir = (curDir) => {
    //load lock.json
    console.log("curDir", path.dirname(curDir));
    projDir = curDir;
    if (projDir.length > 3) {
      packageLockFile = path.join(projDir, packageLockFileName);
      packageJsonFile = path.join(projDir, packageFileName);
      if (fs.existsSync(packageLockFile)) {
        console.log("package-lock.json---> " + packageLockFile);
        // projDir = dirTmp;//要分包的项目目录
      } else {
        projDir = path.dirname(projDir);
        initDir(projDir);
        return;
      }
    } else {
      alert("没有找到package-lock.json文件");
      return;
    }
    if (packageJsonFile != null) {
      console.log("packageJsonFile==> " + packageJsonFile);
      setAssetsDir(projDir + path.sep + "android\\app\\src\\main\\res");
      setBundleDir(projDir + path.sep + "android\\app\\src\\main\\assets");
      setEntry(projDir + path.sep + "platformDep-ui.js");
      fs.readFile(packageJsonFile, "utf8", (err, fileContent) => {
        if (err) {
          if (err.code === "ENOENT") {
            return;
          }
          throw new Error(err);
        }

        const content = JSON.parse(fileContent);
        let deps = content["dependencies"];
        // depsStrs = Object.keys(deps);
        let depsArray = Object.keys(deps);
        for (let i = 0; i < depsArray.length; i++) {
          let depStr = depsArray[i];
          if (depStr == "react" || depStr == "react-native") {
            depsArray[i] = {
              value: depStr,
              label: depStr,
              check: true,
              disabled: true,
            };
          }
        }
        setDeps(depsArray);
        console.log("package json content", content);
      });
    } else {
      alert(
        "请在先在目标工程执行npm install再进入程序，或者选择正确的工程目录"
      );
    }
    const fixPath = require("fix-path");
    fixPath();
  };

  let renderItem = (name, item) => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginTop: name ? "12px" : 0,
          marginRight: "12px",
        }}
      >
        {name ? (
          <div style={{ marginRight: "10px" }}>{name + " :  "}</div>
        ) : null}
        <div style={{ display: "flex", flexDirection: "row" }}>{item}</div>
      </div>
    );
  };

  let renderItema = (name, item) => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginTop: "12px",
        }}
      >
        <div style={{ marginRight: "10px" }}>{name + " :  "}</div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            maxWidth: 900,
            overflow: "hidden",
            textOverflow: "ellipsis",
            flexWrap: "wrap",
          }}
        >
          {item}
        </div>
      </div>
    );
  };

  let renderPlatformSelect = () => {
    return (
      <Radio.Group
        defaultValue="android"
        buttonStyle="solid"
        onChange={(e) => {
          console.log("renderPlatformSelect---> " + e.target.value);
          setPlatform(e.target.value);
        }}
      >
        <Radio.Button value="android">Android</Radio.Button>
        <Radio.Button value="ios">iOS</Radio.Button>
      </Radio.Group>
    );
  };
  let renderEnvSelect = () => {
    return (
      <Radio.Group
        defaultValue="false"
        buttonStyle="solid"
        onChange={(e) => {
          console.log("renderEnvSelect", e);
          setEnv(e.target.value);
        }}
      >
        <Radio.Button value="false">Release</Radio.Button>
        <Radio.Button value="true">Debug</Radio.Button>
      </Radio.Group>
    );
  };
  let renderTypeSelect = () => {
    return (
      <Radio.Group
        defaultValue="base"
        buttonStyle="solid"
        onChange={(e) => {
          console.log("renderEnvSelect-->" + JSON.stringify(e));
          try {
            if (e && e.target) {
              stateRef.current.type = e.target.value;
            }
            if (e && e.target && e.target.value == "base") {
              let temp = 0;
              for (let dep of depsChecked) {
                if (dep == "react" || dep == "react-native") {
                  temp++;
                }
              }
              if (temp != 2) {
                setDepsChecked(["react", "react-native"]);
              }
              setEntry(projDir + path.sep + "platformDep-ui.js");
            } else {
              setEntry("");
              for (let i = 0; i < depsChecked.length; i++) {
                let dep = depsChecked[i];
                if (dep == "react" || dep == "react-native") {
                  depsChecked.splice(i--, 1);
                }
              }
            }
          } catch (e) {
            alert(e);
          }
        }}
      >
        <Radio.Button value="base">基础包</Radio.Button>
        <Radio.Button value="buz">插件包</Radio.Button>
      </Radio.Group>
    );
  };
  let renderFileSelect = (id) => {
    let buttonName = "选择目录";
    if (id == "entry") {
      //file
      buttonName = "选择文件";
      if (entry) {
        buttonName = entry;
      }
    } else if (id == "bundle") {
      if (bundleDir) {
        buttonName = bundleDir;
      }
    } else if (id == "assets") {
      if (assetsDir) {
        buttonName = assetsDir;
      }
    }
    return (
      <Button onClick={(_) => selectFile(id)} block>
        {buttonName}
      </Button>
    );
  };

  let fileSelected = (id, path) => {
    if (id == "entry") {
      //file
      setEntry(path);
    } else if (id == "bundle") {
      setBundleDir(path);
    } else if (id == "assets") {
      setAssetsDir(path);
    }
  };

  let selectFile = (id) => {
    let openType = "openDirectory";
    let title = "选择";
    let filter = undefined;
    if (id == "entry") {
      // openType = 'openFile';
      openType = "multiSelections";
      title = "打包入口文件选择";
      filter = [
        {
          extensions: ["js"],
        },
      ];
    } else if (id == "bundle") {
      title = "打包bundle目录选择";
    } else if (id == "assets") {
      title = "打包资源目录选择";
    }
    console.log("projDir", projDir);
    remote.dialog.showOpenDialog(
      remote.getCurrentWindow(),
      {
        defaultPath: projDir + (id == "entry" ? "\\indexs" : ""),
        title: title,
        buttonLabel: "选择",
        filters: filter,
        properties: [openType],
      },
      (filePath) => {
        if (filePath) {
          let directory = filePath[0];
          if (id == "entry") {
            directory = filePath.join(",,");
          }
          fileSelected(id, directory);
        }
      }
    );
  };

  let renderBundleName = () => {
    return (
      <Input
        ref={(componentInput) => {
          bundleNameInput = componentInput;
        }}
      />
    );
  };

  let onDepCheckChange = (e) => {
    if (stateRef.current.type == "buz") {
      e = e.filter((value) => !(value == "react" || value == "react-native"));
    }
    console.log(JSON.stringify(e));
    setDepsChecked(e);
  };

  let renderDep1 = () => {
    let options = deps;
    let defaultChecked = ["react", "react-native"];
    if (stateRef.current.type == "buz") {
      //插件包不可能把react打进去
      options = options.filter(
        (value) =>
          !(
            value == "react" ||
            value == "react-native" ||
            value.value == "react" ||
            value.value == "react-native"
          )
      );
      defaultChecked = undefined;
    }
    return (
      <CheckboxGroup
        options={options}
        onChange={onDepCheckChange}
        defaultValue={defaultChecked}
      />
    );
  };

  let renderDep = () => {
    let options = [...deps];
    if (
      stateRef.current.type != "buz" &&
      (!depsChecked || depsChecked.length == 0)
    ) {
      setDepsChecked(["react", "react-native"]);
      console.log("---" + depsChecked);
    }
    if (stateRef.current.type == "buz") {
      //插件包不可能把react打进去
      options = options.filter(
        (value) =>
          !(
            value == "react" ||
            value == "react-native" ||
            value.value == "react" ||
            value.value == "react-native"
          )
      );
    }
    return (
      <CheckboxGroup
        options={options}
        onChange={onDepCheckChange}
        value={depsChecked}
      />
    );
  };

  let getAllDeps = (platformDepArray, lockDeps) => {
    let allPlatformDep = [];
    let travelStack = [...platformDepArray];
    while (travelStack.length != 0) {
      let depItem = travelStack.pop();
      allPlatformDep.push(depItem);
      console.log("depItem==> " + depItem);
      let depDetail = lockDeps[depItem];
      if (depDetail == null) {
        console.log("depItem no found", depItem);
        continue;
      }
      let depReq = depDetail["requires"];
      if (depReq != null) {
        travelStack = travelStack.concat(
          _.difference(Object.keys(depReq), allPlatformDep)
        ); //difference防止循环依赖
      }
    }
    console.log("allPlatformDep: " + JSON.stringify(allPlatformDep));
    return _.uniq(allPlatformDep);
  };

  let startPackage = () => {
    if (entry == null) {
      alert("请选择打包的js入口");
      return;
    }
    entrys = entry.split(",,");
    setEntryIndex(0);
    entryIndexRef.current = 0;
    if (entrys.length > 0) {
      setEntryErrorIndex(0);
      setEntryErrorIndexs([]);
      loopPackage();
    }
  };

  let startAndroidPackage = () => {
    setLoading(true);
    setCmdStr("");
    // let cmdStr = './android/gradlew assembleRelease'
    let assembleRelease = selectedChannel.cmd;
    let cmdStr =
      "chcp 65001 && " + projDir + "\\android\\gradlew " + assembleRelease;

    setPackageStaus(1);
    let packageProcess = exec(
      cmdStr,
      { cwd: projDir + "\\android", encoding: "buffer" },
      (error, stdout, stderr) => {
        setLoading(false);
        const iconv = require("iconv-lite");
        if (error) {
          setPackageStaus(-1);
          message.error("打安装包出错！");
          console.error(`执行出错: ${iconv.decode(error.message, "cp936")}`);
          setCmdStr(error);
          if (logTextRef.current)
            logTextRef.current.resizableTextArea.textArea.scrollTop =
              logTextRef.current.resizableTextArea.textArea.scrollHeight;
          // return;
        } else {
          setPackageStaus(2);
          message.info("打安装包完成！");
        }
        console.log(`stdout: ${iconv.decode(stdout, "CP936")}`);
        console.log(`stderr: ${iconv.decode(stderr, "CP936")}`);
      }
    );
    let cmdRetStrs = cmdStr;
    packageProcess.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
      cmdRetStrs += data;
      setCmdStr(cmdRetStrs);
      if (logTextRef.current)
        logTextRef.current.resizableTextArea.textArea.scrollTop =
          logTextRef.current.resizableTextArea.textArea.scrollHeight;
      // console.log(logTextRef.current.resizableTextArea.textArea.scrollHeight)
    });
  };

  let loopPackage = () => {
    if (entryIndexRef.current >= entrys.length) {
      return;
    }
    const entry = entrys[entryIndexRef.current];
    console.log(
      "*************** package  run  no ** " +
      (entryIndexRef.current + 1) +
      " pkg: " +
      entry
    );
    setCmdStr("");
    console.log("-----getModuleVersion----" + getModuleVersion(entry));
    let bundleName =
      (bundleNameInput.input && bundleNameInput.input.value) ||
      (stateRef.current.type == "buz"
        ? entry.substring(entry.lastIndexOf("index"), entry.indexOf(".js")) +
        `_V${versionInput.input.value || getModuleVersion(entry) || "0"
        }.android.bundle`
        : "platform.android.bundle");
    setBundleName(bundleName);
    console.log(stateRef.current.type + "------------------" + bundleName);
    // console.log('bundleName', bundleName
    //     , 'platform', platform, 'env', env, 'entry', entry, 'type', type, 'bundleDir', bundleDir, 'assetsDir', assetsDir
    //     , 'depsChecked', depsChecked);
    if (entry == null) {
      alert("请选择打包的js入口");
      return;
    }
    if (bundleDir == null) {
      alert("请选择jsbundle的目标目录");
      return;
    }
    if (bundleName == null) {
      alert("请选择jsbundle的文件名称");
      return;
    }
    if (assetsDir == null) {
      alert("请选择资源文件的目标目录");
      return;
    }
    let bundleConifgName;
    let platformDepJsonPath = projDir + path.sep + "platformDep.json";
    console.log("platformDepJsonPath--> " + platformDepJsonPath);
    if (stateRef.current.type == "base") {
      bundleConifgName = "platform-ui.config.js";
      fs.writeFileSync(
        platformDepJsonPath,
        JSON.stringify(depsChecked),
        "utf8"
      );
      let platformDepImportPath = projDir + path.sep + "platformDep-import.js";
      let importStr = "";
      depsChecked.forEach((moduleStr) => {
        importStr = importStr + "import '" + moduleStr + "'\n";
      });
      fs.writeFileSync(platformDepImportPath, importStr, "utf8");
    } else {
      bundleConifgName = "buz-ui.config.js";
      const platformDepArray = require(platformDepJsonPath);
      if (!Array.isArray(platformDepArray)) {
        alert("必须先打基础包");
        return; //必须先打基础包
      }
      if (depsChecked.length > 0) {
        //需要过滤platformDepArray
        console.log("-----++> " + packageLockFile);
        const packageLockObj = require(packageLockFile);
        const lockDeps = packageLockObj["dependencies"];
        console.log("start deal platform dep");
        let allPlatformDep = getAllDeps(platformDepArray, lockDeps);
        console.log("start deal buz dep");
        let allBuzDep = getAllDeps(depsChecked, lockDeps);
        let filteredBuzDep = _.difference(allBuzDep, allPlatformDep);
        let buzDepJsonPath = projDir + path.sep + "buzDep.json"; //业务包依赖的路径
        fs.writeFileSync(buzDepJsonPath, JSON.stringify(filteredBuzDep)); //todo 打包脚本读取该数组
      }
    }
    let cmdStr =
      `node ./node_modules/react-native/cli.js bundle  --platform ` +
      platform +
      " --dev " +
      env +
      " --entry-file " +
      entry +
      " --bundle-output " +
      bundleDir +
      path.sep +
      bundleName +
      " --assets-dest " +
      assetsDir +
      " --config " +
      projDir +
      path.sep +
      bundleConifgName;
    console.log(cmdStr);
    setLoading(true);
    setCmd(cmdStr);
    // alert(cmdStr)
    let packageProcess = exec(
      cmdStr,
      { cwd: projDir },
      (error, stdout, stderr) => {
        setLoading(false);
        if (error) {
          console.error(`执行出错: ${error}`);
          setEntryErrorIndex(entryErrorIndex++);
          let entryErrors = [...entryErrorIndexs];
          entryErrors.push(
            entry.substring(entry.lastIndexOf("index"), entry.indexOf(".js"))
          );
          setEntryErrorIndexs(entryErrors);
          setCmdStr(error);
          if (logTextRef.current)
            logTextRef.current.resizableTextArea.textArea.scrollTop =
              logTextRef.current.resizableTextArea.textArea.scrollHeight;
          // return;
        }
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
        setEntryIndex(++entryIndexRef.current);
        loopPackage();
      }
    );
    let cmdRetStrs = cmdStr;
    packageProcess.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
      cmdRetStrs += data;
      setCmdStr(cmdRetStrs);
      if (logTextRef.current)
        logTextRef.current.resizableTextArea.textArea.scrollTop =
          logTextRef.current.resizableTextArea.textArea.scrollHeight;
    });
  };

  // zip 递归读取文件夹下的文件流
  let readDir = (zip, nowPath) => {
    // 读取目录中的所有文件及文件夹（同步操作）
    console.log("----------read-----------");
    let files = fs.readdirSync(nowPath);
    //遍历检测目录中的文件
    files
      .filter((name) => !name.includes(".zip"))
      .forEach((fileName, index) => {
        // 打印当前读取的文件名
        console.log(fileName, index);
        // 当前文件的全路径
        let fillPath = path.join(nowPath, fileName);
        // 获取一个文件的属性
        let file = fs.statSync(fillPath);
        // 如果是目录的话，继续查询
        if (file.isDirectory()) {
          // 压缩对象中生成该目录
          let dirlist = zip.folder(fileName);
          // （递归）重新检索目录文件
          readDir(dirlist, fillPath);
        } else {
          // 压缩目录添加文件
          zip.file(fileName, fs.readFileSync(fillPath));
        }
      });
    console.log("+---------read----------+");
  };

  // 删除目录文件
  let deleteDir = (nowPath) => {
    // 读取目录中的所有文件及文件夹（同步操作）
    let files = fs.readdirSync(nowPath);
    //遍历检测目录中的文件
    console.log("----------delete-----------");
    files
      .filter((name) => !name.includes(".zip"))
      .forEach((fileName, index) => {
        // 打印当前读取的文件名
        // 当前文件的全路径
        let fillPath = path.join(nowPath, fileName);
        // 获取一个文件的属性
        let file = fs.statSync(fillPath);
        // 如果是目录的话，继续查询
        if (file.isDirectory()) {
          // （递归）重新检索目录文件
          deleteDir(fillPath);
          fs.rmdirSync(fillPath);
          console.log(fileName);
        } else {
          // 删除文件
          fs.unlinkSync(fillPath);
          console.log(index + "---" + fileName);
        }
      });
    console.log("+---------delete----------+");
  };

  // 开始压缩文件
  let zipFolder = (target = __dirname, output = __dirname + "/result.zip") => {
    // 创建 zip 实例
    const zip = new JSZIP();
    // zip 递归读取文件夹下的文件流
    readDir(zip, target);
    // 设置压缩格式，开始打包
    zip
      .generateAsync({
        // nodejs 专用
        type: "nodebuffer",
        // 压缩算法
        compression: "DEFLATE",
        // 压缩级别
        compressionOptions: { level: 9 },
      })
      .then((content) => {
        // 将打包的内容写入 当前目录下的 result.zip中
        fs.writeFileSync(output, content, "utf-8");
      })
      .catch((e) => {
        alert(e);
      });
  };

  /**字符串前补0 */
  let formatZero = (num, len) => {
    if (String(num).length > len) return num;
    return (Array(len).join(0) + num).slice(-len);
  };

  //更新Map版本号
  let updateModuleIdConfig = (inputValue) => {
    if (!inputValue) return;
    //只取两位
    if (inputValue && inputValue.length > 2)
      inputValue = inputValue.substring(0, 2);
    let configPath =
      projDir + path.sep + "multibundler" + path.sep + "ModuleIdConfig.json";
    let json = fs.readFileSync(configPath, "utf8");
    let config = JSON.parse(json);
    let selectFileName = entry + "";
    const id = selectFileName.substring(
      selectFileName.lastIndexOf("index") + 5,
      selectFileName.indexOf(".js")
    );
    config[selectFileName.substring(selectFileName.lastIndexOf("\\") + 1)] =
      Number(id + formatZero(inputValue, 2) + "000");
    // 配置排序
    let newConfig = {};
    for (let key of Object.keys(config).sort((a, b) => {
      const idA = a.substring(a.lastIndexOf("index") + 5, a.indexOf(".js"));
      const idB = b.substring(b.lastIndexOf("index") + 5, b.indexOf(".js"));
      return idA - idB;
    })) {
      newConfig[key] = config[key];
    }
    let newJson = JSON.stringify(newConfig, null, 2);
    fs.writeFileSync(configPath, newJson, "utf8");
    let mapPath =
      projDir +
      path.sep +
      "multibundler" +
      path.sep +
      "index" +
      id +
      "Map.json";
    if (fs.existsSync(mapPath)) fs.unlinkSync(mapPath);
    // assets同步
    let asstesPath =
      projDir + path.sep + "android\\app\\src\\main\\assets\\data\\menu.json";
    if (fs.existsSync(asstesPath)) {
      let assetsJson = fs.readFileSync(asstesPath, "utf8");
      let obj = JSON.parse(assetsJson);
      for (const item of obj) {
        for (const child of item.childData) {
          if (child.id == id) {
            child.version = Number(inputValue);
          }
        }
      }
      fs.writeFileSync(asstesPath, JSON.stringify(obj, null, 2), "utf8");
    }
  };

  //新增map
  let addModuleConfig = (newMoudle) => {
    if (newMoudle) {
      let configPath =
        projDir + path.sep + "multibundler" + path.sep + "ModuleIdConfig.json";
      let json = fs.readFileSync(configPath, "utf8");
      let config = JSON.parse(json);
      config[`index${newMoudle.id}.js`] = Number(newMoudle.id + "00000");
      let newConfig = {};
      for (let key of Object.keys(config).sort((a, b) => {
        const idA = a.substring(a.lastIndexOf("index") + 5, a.indexOf(".js"));
        const idB = b.substring(b.lastIndexOf("index") + 5, b.indexOf(".js"));
        return idA - idB;
      })) {
        newConfig[key] = config[key];
      }
      let newJson = JSON.stringify(newConfig, null, 2);
      fs.writeFileSync(configPath, newJson, "utf8");
    }
  };

  //获取Map里面版本号
  let getModuleVersion = (selectFileName) => {
    let configPath =
      projDir + path.sep + "multibundler" + path.sep + "ModuleIdConfig.json";
    let json = fs.readFileSync(configPath, "utf8");
    let config = JSON.parse(json);
    console.log("selectFileName--->" + selectFileName);
    const moduleInfo =
      config[selectFileName.substring(selectFileName.lastIndexOf("\\") + 1)] +
      "";
    console.log("moduleInfo--->" + moduleInfo);
    return (
      Number(
        moduleInfo.substring(moduleInfo.length - 5, moduleInfo.length - 3)
      ) + ""
    );
  };

  //清空原配置
  let cleanConfig = () => {
    let multibundlerPath = projDir + path.sep + "multibundler" + path.sep;
    let mainConfig = multibundlerPath + "platformMap.json";
    fs.writeFileSync(mainConfig, "[]", "utf8");
    let files = fs.readdirSync(multibundlerPath);
    files
      .filter((name) => name.includes("Map.json") && name.includes("index"))
      .forEach((fileName, index) => {
        let fillPath = path.join(multibundlerPath, fileName);
        fs.unlinkSync(fillPath);
      });
    alert("清除完成，请重新打基础包和插件包");
  };

  /**新增模块 创建点击事件 */
  let handleOk = () => {
    if (!modleName) {
      message.info("请输入模块名称！");
      return;
    }
    if (!modlePermission) {
      message.info("请输入模块权限！");
      return;
    }
    if (selectedSys && selectedSys.label) {
      let isExistMode = false;
      let mUpperSelectedSys = selectedSys.label
        .replace(/([A-Z])/g, "_$1")
        .toLocaleUpperCase();
      let jsonPath =
        projDir + path.sep + "android\\app\\src\\main\\assets\\data\\menu.json";
      if (!fs.existsSync(jsonPath)) {
        return;
      }
      let jsonStr = fs.readFileSync(jsonPath, "utf8");
      let menuList = JSON.parse(jsonStr);
      if (selectedSys.label == "prs") {
        mUpperSelectedSys = "Collection";
      }
      let newMoudle = {
        childName: modleName,
        permission: modlePermission,
        parent: mUpperSelectedSys,
        resKey:
          "model" +
          modlePermission.replace(/([A-Z])/g, "_$1").toLocaleLowerCase(),
        id: selectedSys.id * 1000 + 1,
        version: 0,
      };
      console.log("mUpperSelectedSys--->" + mUpperSelectedSys);
      for (let menuInfo of menuList) {
        if (menuInfo.permission == mUpperSelectedSys) {
          // alert(JSON.stringify(menuInfo.childData, null, 2))
          for (let menuChild of menuInfo.childData) {
            if (menuChild.permission == modlePermission) {
              newMoudle = menuChild;
              isExistMode = true;
              break;
            }
            if (menuChild.id >= newMoudle.id) {
              newMoudle = {
                childName: modleName,
                permission: modlePermission,
                parent: mUpperSelectedSys,
                resKey:
                  "model" +
                  modlePermission
                    .replace(/([A-Z])/g, "_$1")
                    .toLocaleLowerCase(),
                id: menuChild.id + 1,
                version: 0,
              };
            }
          }
          console.log("newMoudle.id--->" + newMoudle.id);
          menuInfo.childData.push(newMoudle);
        }
      }
      if (!isExistMode) {
        fs.writeFileSync(jsonPath, JSON.stringify(menuList, null, 2), "utf-8");
      }

      // 入口创建
      let mSelectedSysItem = {
        key: selectedSys.key,
        label: selectedSys.label,
        id: selectedSys.id,
      };
      if (mSelectedSysItem.label == "cims") {
        mSelectedSysItem.label = "cims2";
      }
      setSelectedSys(mSelectedSysItem);
      let clasePackageName =
        modlePermission.charAt(0).toLocaleLowerCase() +
        modlePermission.slice(
          1,
          modlePermission.includes("Page")
            ? modlePermission.indexOf("Page")
            : modlePermission.length
        );
      let classPath =
        projDir +
        path.sep +
        "app\\page\\" +
        mSelectedSysItem.label +
        "\\" +
        clasePackageName;
      if (!fs.existsSync(classPath)) fs.mkdirSync(classPath);
      fs.writeFileSync(
        classPath + "\\index.tsx",
        `//${modleName}\n` +
        "import React from 'react';" +
        "\n" +
        "import { NavigationContainer } from '@react-navigation/native';" +
        "\n" +
        "import { createStackNavigator } from '@react-navigation/stack';" +
        "\n" +
        `import ${modlePermission} from './${modlePermission}';` +
        "\n" +
        "import { mapProps } from '../../../../baseApp';" +
        "\n" +
        `// 界面参数类型 参数默认undefined，参数可以是一个object` +
        "\n" +
        `export type RootStackTransferMergeBoxes = {` +
        "\n" +
        `\t${modlePermission}: undefined` +
        "\n" +
        `}` +
        "\n\n" +
        "const Stack = createStackNavigator();" +
        "\n" +
        "const APP = (props: any) => {" +
        "\n" +
        "\treturn (" +
        "\n" +
        "\t\t<NavigationContainer>" +
        "\n" +
        "\t\t\t<Stack.Navigator>" +
        "\n" +
        `\t\t\t\t<Stack.Screen name="${modlePermission}" options={{ headerShown: false }} component={mapProps(${modlePermission}, props)} />` +
        "\n" +
        "\t\t\t</Stack.Navigator>" +
        "\n" +
        "\t\t</NavigationContainer>" +
        "\n" +
        "\t);" +
        "\n" +
        "}" +
        "\n\n" +
        "export default APP;"
      );
      // 界面首页
      fs.writeFileSync(
        classPath + `\\${modlePermission}.tsx`,
        `` +
        "import React from 'react'" +
        "\n" +
        "import { View } from 'react-native'" +
        "\n" +
        "import { CommonStyle } from 'react-native-yunexpress-ui'" +
        "\n" +
        (stateRef.current.isAddI18n
          ? `import I18n from '../../../i18n/${mSelectedSysItem.label}/${clasePackageName}'\n`
          : "") +
        `import HeadBar from "../../../components/HeadBar"` +
        "\n" +
        `import { RootStackTransferMergeBoxes } from '.'` +
        "\n" +
        `import { StackNavigationProp } from '@react-navigation/stack'` +
        "\n" +
        `import { ReactProps } from '@/types/global'` +
        "\n\n" +
        `type Props = {` +
        "\n" +
        `\tnavigation: StackNavigationProp<RootStackTransferMergeBoxes, '${modlePermission}'>` +
        "\n" +
        `}` +
        "\n\n" +
        `//${modleName}\n` +
        `export default function ${modlePermission}(props: Props & ReactProps){\n\n` +
        `\treturn(\n` +
        `\t\t<View style={CommonStyle.baseBackgrand}>\n` +
        `\t\t\t<HeadBar\n` +
        `\t\t\t\t{...props}\n` +
        `\t\t\t\tBGColor={2}\n` +
        (stateRef.current.isAddI18n
          ? `\t\t\t\ttitle={I18n.t('Title')}\n`
          : `\t\t\t\ttitle={"${modleName}"}\n`) +
        `\t\t\t\thideRightView\n` +
        `\t\t\t\t/>\n` +
        `\t\t</View>\n` +
        `\t)\n` +
        `}`
      );

      if (!isExistMode) {
        //新增map配置
        addModuleConfig(newMoudle);
        // 正式index入口配置
        let indexPath =
          projDir + path.sep + "indexs\\index" + newMoudle.id + ".js";
        fs.writeFileSync(
          indexPath,
          `//${modleName}\n` +
          "import { AppRegistry } from 'react-native';" +
          "\n" +
          "import { AppWrapper } from '../baseApp';" +
          "\n" +
          "import " +
          modlePermission +
          " from '../app/page/" +
          mSelectedSysItem.label +
          "/" +
          modlePermission.charAt(0).toLocaleLowerCase() +
          modlePermission.slice(1) +
          "'\n" +
          "AppRegistry.registerComponent('yunexpress_app_" +
          newMoudle.id +
          "', () => AppWrapper(" +
          modlePermission +
          "));"
        );
        // 调试入口配置
        let yunExpressIndexPath = projDir + path.sep + "YunExpressIndex.js";
        let yunExpressIndexFile = fs.readFileSync(yunExpressIndexPath, "utf8");
        let lastSysImportToEnd = yunExpressIndexFile.substring(
          yunExpressIndexFile.lastIndexOf(
            "./app/page/" + mSelectedSysItem.label
          )
        );
        let lastSysImport = lastSysImportToEnd.substring(
          0,
          lastSysImportToEnd.indexOf("\n")
        );
        let newImport =
          lastSysImport +
          "\n" +
          `import ${modlePermission} from './app/page/${mSelectedSysItem.label + "/" + clasePackageName
          }/index'; //${modleName}`;
        yunExpressIndexFile = yunExpressIndexFile.replace(
          lastSysImport,
          newImport
        );
        let constSysAppsFunciotnToEnd = yunExpressIndexFile.substring(
          yunExpressIndexFile.indexOf(`const ${mSelectedSysItem.label}Apps = {`)
        );
        let constSysAppsFunciotn = constSysAppsFunciotnToEnd.substring(
          0,
          constSysAppsFunciotnToEnd.indexOf("}")
        );
        let newFuncion =
          constSysAppsFunciotn +
          `	yunexpress_app_${newMoudle.id}: ${modlePermission}, //${modleName}\n`;
        yunExpressIndexFile = yunExpressIndexFile.replace(
          constSysAppsFunciotn,
          newFuncion
        );
        fs.writeFileSync(yunExpressIndexPath, yunExpressIndexFile, "utf-8");
      }
      // 新增多语言文件
      if (stateRef.current.isAddI18n) {
        let i18nDir =
          projDir +
          path.sep +
          "app" +
          path.sep +
          "i18n" +
          path.sep +
          mSelectedSysItem.label;
        if (!fs.existsSync(i18nDir)) {
          fs.mkdirSync(i18nDir);
        }
        let clasePackageName =
          modlePermission.charAt(0).toLocaleLowerCase() +
          modlePermission.slice(
            1,
            modlePermission.includes("Page")
              ? modlePermission.indexOf("Page")
              : modlePermission.length
          );
        let modeI18nDir = i18nDir + path.sep + clasePackageName;
        if (!fs.existsSync(modeI18nDir)) {
          fs.mkdirSync(modeI18nDir);
        }
        let index = modeI18nDir + path.sep + "index.ts";
        fs.writeFileSync(
          index,
          "" +
          `import { translate } from '../../t'\n` +
          `import { word } from './word'\n\n` +
          `export default class I18n {\n\n` +
          `\t/**\n` +
          `\t * ${modleName}获取词条\n` +
          `\t * xx:{zh: 'Xx%{k}xxx', ...}\n` +
          `\t * I18n.t('xx', {k:v}) //Xxvxxx\n` +
          `\t * @param {string} key\n` +
          `\t * @param {object} value\n` +
          `\t */\n` +
          `\tstatic t(key: string, value?: { [key: string]: any }) {\n` +
          `\t\treturn translate(word, key, value)\n` +
          `\t}\n` +
          `}`
        );
        let word = modeI18nDir + path.sep + "word.ts";
        fs.writeFileSync(
          word,
          "" +
          `import type { NObject } from "../../t"\n\n` +
          `// ${modleName}多语言词条\n` +
          `export const word: NObject = {\n` +
          `\t"Title": {\n` +
          `\t\t"zh": "${modleName}",\n` +
          `\t\t"en": "${modleName}",\n` +
          `\t\t"fr": "${modleName}",\n` +
          `\t},\n` +
          `}`
        );
      }
      message.info("创建模块成功");
    } else {
      message.info("请选择系统！");
      return;
    }
    // set(undefined)
    setVisible(false);
  };

  let handleCancel = () => {
    // setSeSelectedSyslectedSys(undefined)
    setVisible(false);
  };

  /**
   * 获取打包按钮属性
   */
  let getPackageBtnText = () => {
    let btnText = { name: "打安装包", color: "#555" };
    switch (packageStaus) {
      case 0:
      case 1:
        btnText = { name: "打安装包", color: "#555" };
        break;
      case 2:
        btnText = { name: "打包成功", color: "green" };
        break;
      case -1:
        btnText = { name: "打包失败", color: "red" };
        break;
    }
    return btnText;
  };

  /**获取模块信息 */
  let getModules = () => {
    const jsonPath =
      projDir + path.sep + "android\\app\\src\\main\\assets\\data\\menu.json";
    let obj = [];
    if (fs.existsSync(jsonPath)) {
      let json = fs.readFileSync(jsonPath, "utf8");
      obj = JSON.parse(json);
      let collection = obj[0];
      // console.log('collection======', collection)
      if (
        collection &&
        Array.isArray(collection.childData) &&
        collection.permission == "Collection"
      ) {
        collection.childData.unshift({
          childName: "历史任务",
          id: 11,
          permission: "HistoryTask",
          version: 0,
          resKey: "model_history_task",
          parent: "Collection",
        });
        collection.childData.unshift({
          childName: "揽收任务",
          id: 10,
          permission: "TabTask",
          resKey: "model_tab_task",
          version: 0,
          parent: "Collection",
        });
      }
    }
    // console.log('collection======2', collection)
    const subColumns = [
      {
        title: "功能",
        dataIndex: "childName",
        key: "childName",
        render: (data) => <a>{data}</a>,
      },
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        sorter: (a, b) => a.id - b.id,
      },
      {
        title: "权限",
        dataIndex: "permission",
        key: "permission",
      },
      {
        title: "版本",
        dataIndex: "version",
        key: "version",
      },
    ];
    const columns = [
      {
        title: "系统",
        dataIndex: "groupName",
        key: "groupName",
      },
      {
        title: "权限",
        dataIndex: "permission",
        key: "permission",
      },
      {
        title: "Key",
        dataIndex: "resKey",
        key: "resKey",
      },
      // {
      //     title: '模块',
      //     dataIndex: 'childData',
      //     key: 'childData',
      //     // render: (data) => {
      //     //     return <Table columns={subColumns} dataSource={data} />
      //     // }
      // },
    ];
    return (
      <Table
        bordered
        columns={columns}
        pagination={false}
        dataSource={obj}
        rowKey={"resKey"}
        expandable={{
          expandedRowRender: (data) => (
            <Table
              bordered
              size={"small"}
              rowKey={"resKey"}
              pagination={false}
              columns={subColumns}
              dataSource={data.childData}
            />
          ),
          rowExpandable: (data) => data.childData != null,
          expandRowByClick: true,
        }}
      />
    );
  };

  // 界面UI
  return (
    <div
      style={{
        paddingLeft: 30,
        paddingTop: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", flexDirection: "row" }}>
        {renderItem("平台", renderPlatformSelect())}
        {renderItem("环境", renderEnvSelect())}
        {renderItem("类型", renderTypeSelect())}
      </div>
      <div style={{ display: "flex", flexDirection: "row" }}>
        {renderItema("入口", renderFileSelect("entry"))}
        <div style={{ width: "20px" }}></div>
        {stateRef.current.type == "buz"
          ? renderItem(
            "版本",
            <Input
              disabled={!entry || (entry && entry.includes(",,"))}
              ref={(ref) => (versionInput = ref)}
              onChange={(e) => {
                if (e.target.value) {
                  setAssetsDir(projDir + "\\remotebundles");
                  setBundleDir(projDir + "\\remotebundles");
                } else {
                  setAssetsDir(
                    projDir + path.sep + "android\\app\\src\\main\\res"
                  );
                  setBundleDir(
                    projDir + path.sep + "android\\app\\src\\main\\assets"
                  );
                }
                updateModuleIdConfig(e.target.value);
              }}
            />
          )
          : null}
      </div>
      <div style={{ display: "flex", flexDirection: "row" }}>
        {renderItem("bundle目录", renderFileSelect("bundle"))}
        {renderItem("bundle名称(可不填)", renderBundleName())}
      </div>
      {renderItem("assets目录", renderFileSelect("assets"))}

      <div style={{ display: "flex", flexDirection: "row" }}>
        <Button
          style={{ marginTop: 12, width: 80, color: "#555" }}
          onClick={() => {
            let newDep = [];
            for (let dep of deps) {
              if (typeof dep == "string") {
                newDep.push(dep);
              }
            }
            if (stateRef.current.type == "buz") {
              if (
                depsChecked.length == 2 &&
                depsChecked[0] == "react" &&
                depsChecked[1] == "react-native"
              ) {
                setDepsChecked([]);
              }
              if (!depsChecked || depsChecked.length == 0) {
                if (
                  newDep.length == 2 &&
                  newDep[0] == "react" &&
                  newDep[1] == "react-native"
                ) {
                  newDep = [];
                }
                setDepsChecked(newDep);
              } else {
                setDepsChecked([]);
              }
            } else {
              if (
                depsChecked &&
                depsChecked.length == 2 &&
                depsChecked[0] == "react" &&
                depsChecked[1] == "react-native"
              ) {
                setDepsChecked(["react", "react-native", ...newDep]);
              } else {
                setDepsChecked(["react", "react-native"]);
              }
            }
          }}
        >
          全选
        </Button>
        <Button
          style={{ marginTop: 12, marginLeft: 15, width: 100, color: "#555" }}
          onClick={() => {
            alert(JSON.stringify(depsChecked, null, 2));
          }}
        >
          查看选择
        </Button>
        <Button
          style={{ marginTop: 12, marginLeft: 15, width: 120, color: "#555" }}
          onClick={() => {
            remote.shell.openItem(bundleDir);
          }}
        >
          跳转打包目录
        </Button>
        {stateRef.current.type == "buz" ? (
          <Button
            style={{ marginTop: 12, marginLeft: 15, width: 130, color: "#555" }}
            onClick={() => {
              // remote.shell.openItem(projDir + '\\remotebundles')
              const packageDir = projDir + "\\remotebundles\\";
              fs.readdir(
                projDir + "\\remotebundles\\drawable-mdpi",
                "utf8",
                (e, files) => {
                  // alert(JSON.stringify(files, null, 2))
                  fs.readdir(
                    projDir + "\\android\\app\\src\\main\\res\\drawable-mdpi",
                    "utf8",
                    (e, resFiles) => {
                      let zipRes = [];
                      files &&
                        files.forEach((file) => {
                          if (resFiles.includes(file)) {
                            fs.unlinkSync(
                              projDir +
                              "\\remotebundles\\drawable-mdpi\\" +
                              file
                            );
                          } else {
                            zipRes.push(file);
                          }
                        });
                      zipFolder(
                        packageDir,
                        packageDir +
                        (bundleName ||
                          entry.substring(
                            entry.lastIndexOf("index"),
                            entry.indexOf(".js")
                          ) +
                          `_V${versionInput.input.value || "0"
                          }.android.bundle`) +
                        ".zip"
                      );
                      deleteDir(packageDir);
                    }
                  );
                }
              );
            }}
          >
            生成插件更新包
          </Button>
        ) : (
          <Button
            style={{ marginTop: 12, marginLeft: 15, width: 120, color: "#555" }}
            onClick={() => {
              cleanConfig();
            }}
          >
            清空原来配置
          </Button>
        )}
        <Button
          style={{ marginTop: 12, marginLeft: 15, width: 120, color: "#555" }}
          onClick={() => {
            showDrawer();
          }}
        >
          查看模块详情
        </Button>
        <Button
          style={{ marginTop: 12, marginLeft: 15, width: 100, color: "#555" }}
          onClick={() => {
            setVisible(true);
          }}
        >
          新增模块
        </Button>
      </div>
      <div style={{ marginTop: "12px" }}>模块依赖:</div>
      {renderItem(null, renderDep())}
      <div
        style={{
          marginTop: 12,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Button
          style={{ marginRight: 10, width: 120, color: "#555" }}
          loading={loading}
          onClick={startPackage}
        >
          打RN包
        </Button>
        <div style={{ color: entryErrorIndex ? "red" : "green" }}>
          {"打包总共" +
            entrys.length +
            "个：成功" +
            (entryIndex - entryErrorIndex) +
            "个，失败" +
            entryErrorIndex +
            "个" +
            (entryErrorIndex
              ? "，失败index-->" + JSON.stringify(entryErrorIndexs)
              : "")}
        </div>
      </div>
      <div
        style={{ flexDirection: "row", display: "flex", alignItems: "center" }}
      >
        <Button
          style={{
            marginRight: 10,
            marginTop: 10,
            width: 120,
            color: getPackageBtnText().color,
          }}
          loading={loading}
          onClick={startAndroidPackage}
        >
          {getPackageBtnText().name}
        </Button>
        <div
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: "10px",
          }}
        >
          <span style={{ color: "#555" }}>打包渠道：</span>
          <Dropdown overlay={channel} trigger={["click"]} selectable>
            <Space>
              {selectedChannel.label || "请选择渠道"}
              <DownOutlined />
            </Space>
          </Dropdown>
        </div>
        <Button
          style={{
            marginLeft: 15,
            marginRight: 10,
            marginTop: 10,
            width: 130,
            color: "#555",
          }}
          onClick={() => {
            if (!remote.shell.openItem(projDir + selectedChannel.dir)) {
              message.info("目录文件不存在，请先打安装包！");
            }
          }}
        >
          跳转安装包目录
        </Button>
        <Button
          style={{ width: 160, marginLeft: 5, marginTop: 10 }}
          onClick={() => {
            const fs = require("fs");
            const path = require("path");
            let newDateFile = {};
            // let dir = projDir + '\\android\\app\\build\\outputs\\apk\\YT\\release\\'
            let dir = projDir + selectedChannel.dir;
            fs.readdirSync(dir).forEach((fileName) => {
              const fileDir = path.join(dir, fileName);
              let stats = fs.statSync(fileDir);
              if (stats.isFile() && fileDir.endsWith(".apk")) {
                console.log(JSON.stringify(stats.atimeMs) + "**" + fileName);
                if (!newDateFile.atimeMs) {
                  newDateFile.atimeMs = stats.atimeMs;
                  newDateFile.path = fileDir;
                } else if (newDateFile.atimeMs < stats.atimeMs) {
                  newDateFile.atimeMs = stats.atimeMs;
                  newDateFile.path = fileDir;
                  console.log(JSON.stringify(stats.atimeMs) + "--" + fileName);
                }
              }
            });
            console.log(
              JSON.stringify(newDateFile.path) +
              "------------" +
              newDateFile.atimeMs
            );
            const os = require("os");
            const ifaces = os.networkInterfaces();
            let ip = "";
            for (let con in ifaces) {
              if (con == "本地链接" || con == "以太网") {
                for (let j = 0; j < ifaces[con].length; j++) {
                  if (ifaces[con][j].family == "IPv4") {
                    ip = ifaces[con][j].address;
                  }
                }
              }
            }
            let copyPath = `http://${ip}:8081/${newDateFile.path
              .substring(newDateFile.path.indexOf("android\\"))
              .replace(/\\/g, "/")}`;
            let cmdStr = `CHCP 65001 && echo ${copyPath} | clip`;
            console.log("copyPath=======>" + copyPath);
            WinExec.cmd(cmdStr);
            message.info("复制安装包本地链接成功");
          }}
        >
          复制安装包本地链接
        </Button>
        {isUploadPremission ? (
          <Button
            style={{
              marginLeft: 15,
              marginRight: 10,
              marginTop: 10,
              width: 100,
              color: "#555",
            }}
            onClick={() => {
              // message.info('正在上传，请稍候...')
              props.goUpload && props.goUpload();
            }}
          >
            上传
          </Button>
        ) : null}
      </div>
      <div>{cmd}</div>
      <TextArea
        ref={logTextRef}
        value={cmdStr}
        rows={10}
        readOnly
        style={{ marginTop: 12, width: 1200 }}
      />
      {/* ==============================================新增模块弹框======================================== */}
      <Modal
        title="新增模块"
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            返回
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            创建
          </Button>,
        ]}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <span style={{ color: "#555" }}>模块名称：</span>
          <Input
            style={{ flex: 1 }}
            onChange={(e) => {
              if (e.target) {
                setModleName(e.target.value);
              }
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginTop: "10px",
          }}
        >
          <span style={{ color: "#555" }}>模块权限：</span>
          <Input
            style={{ flex: 1 }}
            onChange={(e) => {
              if (e.target) {
                setModlePermission(e.target.value);
              }
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginTop: "10px",
          }}
        >
          <span style={{ color: "#555" }}>模块系统：</span>
          <Dropdown overlay={menu} trigger={["click"]} selectable>
            <Space>
              {(selectedSys && selectedSys.label) || "请选择系统"}
              <DownOutlined />
            </Space>
          </Dropdown>
        </div>
        <Space style={{ marginTop: 10 }}>
          <Checkbox
            defaultChecked
            onChange={(e) => {
              console.log(`checked = ${e.target.checked}`);
              stateRef.current.isAddI18n = !!e.target.checked;
            }}
          />
          <span>是否同时新增多语言</span>
        </Space>
      </Modal>
      {/* ===========================================模块信息侧边抽屉================================= */}
      <Drawer
        title="模块信息"
        width={700}
        placement="right"
        onClose={onClose}
        open={open}
      >
        {getModules()}
      </Drawer>
    </div>
  );
}
