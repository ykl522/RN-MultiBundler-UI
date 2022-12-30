/*
 * 打包 界面   
 * @Author: 袁康乐 yuankangle@yunexpress.cn
 * @Date: 2022-10-21 16:37:25
 * @LastEditors: 康乐 yuankangle@yunexpress.cn
 * @LastEditTime: 2022-12-19 15:08:12
 * @FilePath: \RN-MultiBundler-UI\src\page\PackageView.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const { Button, Checkbox, Input, Radio, Modal, Dropdown, Space, Menu, message, Drawer, Table } = require('antd');
const CheckboxGroup = Checkbox.Group;
const { remote } = require("electron");
const { exec } = require('child_process');
import { useState, useEffect, useRef } from 'react';
import { DownOutlined } from '@ant-design/icons';
const path = require('path');
const JSZIP = require("jszip");
const fs = require("fs");
var _ = require('lodash');
const { TextArea } = Input;
const packageLockFileName = 'package-lock.json';
// const packageLockFileName = 'yarn.lock';
const packageFileName = 'package.json';
import { workSpace } from '../config'
const curBinDirName = workSpace || __dirname;
let versionInput = null
let bundleNameInput = null
let entrys = []
let projDir = curBinDirName
let packageJsonFile = path.join(projDir, packageFileName)
let packageLockFile = path.join(projDir, packageLockFileName);

export default function PackageView(props) {

    const sysItems = [
        { label: 'prs', key: '0', },
        { label: 'ots', key: '1', },
        { label: 'ops', key: '2', },
        { label: 'cims', key: '3', },
        { label: 'rms', key: '4', },
        { label: 'cis', key: '5', },
        { label: 'dts', key: '6', },
    ]

    const channelItems = [
        { label: 'YT', key: '0', cmd: 'assembleYTRelease', dir: '\\android\\app\\build\\outputs\\apk\\YT\\release' },
        { label: 'FWS', key: '1', cmd: 'assembleFWSRelease', dir: '\\android\\app\\build\\outputs\\apk\\FWS\\release' },
        { label: 'YT-DEBUG', key: '2', cmd: 'assembleYTDebug', dir: '\\android\\app\\build\\outputs\\apk\\YT\\debug' },
        { label: 'FWS-DEBUG', key: '3', cmd: 'assembleFWSDebug', dir: '\\android\\app\\build\\outputs\\apk\\FWS\\debug' },
        { label: 'Clean', key: '4', cmd: 'clean build', dir: '\\android\\app' }
    ]

    const menu = (
        <Menu
            selectable
            onClick={(e) => {
                if (sysItems[e.key].label) {
                    setSelectedSys(sysItems[e.key].label)
                }
            }}
            items={sysItems}
        />
    );
    const channel = (
        <Menu
            selectable
            onClick={(e) => {
                if (channelItems[e.key].label) {
                    setSelectedChannel(channelItems[e.key])
                    setPackageStaus(0)
                }
            }}
            items={channelItems}
        />
    );
    const entryIndexRef = useRef(0)
    const logTextRef = useRef()
    const stateRef = useRef({ type: 'base' })
    const [entryIndex, setEntryIndex] = useState(0)
    const [platform, setPlatform] = useState('android') //平台 android iOS
    const [env, setEnv] = useState('false') //环境 release debug
    const [entry, setEntry] = useState(null) //打包入口
    const [bundleDir, setBundleDir] = useState(null) //打包后bundle目录
    const [bundleName, setBundleName] = useState(null) //bundle名
    const [assetsDir, setAssetsDir] = useState(null) //asset目录
    const [deps, setDeps] = useState([])
    const [depsChecked, setDepsChecked] = useState([])
    const [cmdStr, setCmdStr] = useState('')
    const [cmd, setCmd] = useState('')
    const [loading, setLoading] = useState(false)
    const [entryErrorIndex, setEntryErrorIndex] = useState(0)
    const [entryErrorIndexs, setEntryErrorIndexs] = useState([])
    const [visible, setVisible] = useState(false)
    const [selectedSys, setSelectedSys] = useState(undefined)
    const [selectedChannel, setSelectedChannel] = useState(channelItems[0])
    const [packageStaus, setPackageStaus] = useState(0)
    const [modleName, setModleName] = useState('')
    const [modlePermission, setModlePermission] = useState('')

    const [open, setOpen] = useState(false);
    const showDrawer = () => {
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    };

    useEffect(() => {

        window.api && window.api.changeDir((event, value) => {
            // event.sender.send('counter-value', newValue)
            console.log(value)
        })
        // let openType = 'openDirectory';
        // let filter = undefined;
        // let title = '清选择RN工程目录';
        initDir(curBinDirName)
        // setTimeout(() => {
        // }, 2000)
        // remote.dialog.showOpenDialog(
        //     remote.getCurrentWindow(),
        //     {
        //         defaultPath: curBinDirName,
        //         title: title,
        //         buttonLabel: '选择',
        //         filters: filter,
        //         properties: [openType]
        //     },
        //     (filePath) => {
        //         if (filePath) {
        //             const directory = filePath[0];
        //             initDir(directory);
        //         }
        //     }
        // )
    }, [])

    let initDir = (curDir) => {
        //load lock.json
        // const curDir = curBinDirName;
        console.log('curDir', path.dirname(curDir));
        projDir = curDir;
        while (projDir.length > 2) {
            packageLockFile = path.join(projDir, packageLockFileName);
            packageJsonFile = path.join(projDir, packageFileName);
            if (fs.existsSync(packageLockFile)) {
                console.log('package-lock.json---> ' + packageLockFile);
                // projDir = dirTmp;//要分包的项目目录
                break;
            }
            dirTmp = path.dirname(projDir);
        }
        if (packageJsonFile != null) {
            console.log('packageJsonFile==> ' + packageJsonFile)
            setAssetsDir(projDir + path.sep + 'android\\app\\src\\main\\res')
            setBundleDir(projDir + path.sep + 'android\\app\\src\\main\\assets')
            setEntry(projDir + path.sep + 'platformDep-ui.js');
            fs.readFile(packageJsonFile, 'utf8', (err, fileContent) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        return
                    }
                    throw new Error(err)
                }

                const content = JSON.parse(fileContent);
                let deps = content['dependencies'];
                // depsStrs = Object.keys(deps);
                let depsArray = Object.keys(deps);
                for (let i = 0; i < depsArray.length; i++) {
                    let depStr = depsArray[i];
                    if (depStr == 'react' || depStr == 'react-native') {
                        depsArray[i] = { value: depStr, label: depStr, check: true, disabled: true };
                    }
                }
                setDeps(depsArray)
                console.log('package json content', content);
            });
        } else {
            alert('请在先在目标工程执行npm install再进入程序，或者选择正确的工程目录');
        }
        const fixPath = require('fix-path');
        fixPath();
    }

    let renderItem = (name, item) => {
        return (<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: name ? '12px' : 0, marginRight: '12px' }}>
            {name ? <div style={{ marginRight: '10px' }}>{name + ' :  '}</div> : null}
            <div style={{ display: 'flex', flexDirection: 'row' }}>{item}</div>
        </div>)
    }

    let renderItema = (name, item) => {
        return (<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: '12px' }}>
            <div style={{ marginRight: '10px' }}>{name + ' :  '}</div>
            <div style={{ display: 'flex', flexDirection: 'row', maxWidth: 900, overflow: 'hidden', textOverflow: 'ellipsis', flexWrap: 'wrap' }}>{item}</div>
        </div>)
    }

    let renderPlatformSelect = () => {
        return (<Radio.Group defaultValue="android" buttonStyle="solid"
            onChange={(e) => {
                console.log('renderPlatformSelect---> ' + e.target.value);
                setPlatform(e.target.value)
            }}>
            <Radio.Button value="android">Android</Radio.Button>
            <Radio.Button value="ios">iOS</Radio.Button>
        </Radio.Group>);
    }
    let renderEnvSelect = () => {
        return (<Radio.Group defaultValue="false" buttonStyle="solid"
            onChange={(e) => {
                console.log('renderEnvSelect', e);
                setEnv(e.target.value)
            }}>
            <Radio.Button value="false">Release</Radio.Button>
            <Radio.Button value="true">Debug</Radio.Button>
        </Radio.Group>);
    }
    let renderTypeSelect = () => {
        return (<Radio.Group defaultValue="base" buttonStyle="solid"
            onChange={(e) => {
                console.log('renderEnvSelect-->' + JSON.stringify(e));
                try {
                    if (e && e.target) {
                        stateRef.current.type = e.target.value
                    }
                    if (e && e.target && e.target.value == 'base') {
                        let temp = 0
                        for (let dep of depsChecked) {
                            if (dep == 'react' || dep == 'react-native') {
                                temp++
                            }
                        }
                        if (temp != 2) {
                            setDepsChecked(['react', 'react-native'])
                        }
                        setEntry(projDir + path.sep + 'platformDep-ui.js')
                    } else {
                        setEntry('')
                        for (let i = 0; i < depsChecked.length; i++) {
                            let dep = depsChecked[i]
                            if (dep == 'react' || dep == 'react-native') {
                                depsChecked.splice(i--, 1);
                            }
                        }
                    }
                } catch (e) {
                    alert(e)
                }
            }}
        >
            <Radio.Button value="base">基础包</Radio.Button>
            <Radio.Button value="buz">插件包</Radio.Button>
        </Radio.Group>);
    }
    let renderFileSelect = (id) => {
        let buttonName = '选择目录';
        if (id == 'entry') {//file
            buttonName = '选择文件';
            if (entry) {
                buttonName = entry;
            }
        } else if (id == 'bundle') {
            if (bundleDir) {
                buttonName = bundleDir;
            }
        } else if (id == 'assets') {
            if (assetsDir) {
                buttonName = assetsDir;
            }
        }
        return (<Button onClick={_ => selectFile(id)} block>{buttonName}</Button>);
    }

    let fileSelected = (id, path) => {
        if (id == 'entry') {//file
            setEntry(path)
        } else if (id == 'bundle') {
            setBundleDir(path)
        } else if (id == 'assets') {
            setAssetsDir(path)
        }
    }

    let selectFile = (id) => {
        let openType = 'openDirectory';
        let title = '选择';
        let filter = undefined;
        if (id == 'entry') {
            // openType = 'openFile';

            openType = 'multiSelections';


            title = '打包入口文件选择';
            filter = [
                {
                    extensions: ['js']
                }
            ]
        } else if (id == 'bundle') {
            title = '打包bundle目录选择';
        } else if (id == 'assets') {
            title = '打包资源目录选择';
        }
        console.log('projDir', projDir);
        remote.dialog.showOpenDialog(
            remote.getCurrentWindow(),
            {
                defaultPath: projDir + (id == 'entry' ? '\\indexs' : ''),
                title: title,
                buttonLabel: '选择',
                filters: filter,
                properties: [openType]
            },
            (filePath) => {
                if (filePath) {
                    let directory = filePath[0];
                    if (id == 'entry') {
                        directory = filePath.join(",,");
                    }
                    fileSelected(id, directory);
                }
            }
        )
    }

    let renderBundleName = () => {
        return (<Input ref={(componentInput) => { bundleNameInput = componentInput }} />);
    }

    let onDepCheckChange = (e) => {
        if (stateRef.current.type == 'buz') {
            e = e.filter((value) => !(value == 'react' || value == 'react-native'));
        }
        console.log(JSON.stringify(e));
        setDepsChecked(e)
    }

    let renderDep1 = () => {
        let options = deps;
        let defaultChecked = ['react', 'react-native'];
        if (stateRef.current.type == 'buz') {//插件包不可能把react打进去
            options = options.filter((value) => !(value == 'react' || value == 'react-native'
                || value.value == 'react' || value.value == 'react-native'));
            defaultChecked = undefined;
        }
        return <CheckboxGroup options={options} onChange={onDepCheckChange} defaultValue={defaultChecked} />
    }

    let renderDep = () => {
        let options = [...deps];
        if (stateRef.current.type != 'buz' && (!depsChecked || depsChecked.length == 0)) {
            setDepsChecked(['react', 'react-native'])
            console.log('---' + depsChecked)
        }
        if (stateRef.current.type == 'buz') {//插件包不可能把react打进去
            options = options.filter((value) => !(value == 'react' || value == 'react-native'
                || value.value == 'react' || value.value == 'react-native'));
        }
        return <CheckboxGroup
            options={options}
            onChange={onDepCheckChange}
            value={depsChecked}
        />

    }

    let getAllDeps = (platformDepArray, lockDeps) => {
        let allPlatformDep = [];
        let travelStack = [...platformDepArray];
        while (travelStack.length != 0) {
            let depItem = travelStack.pop();
            allPlatformDep.push(depItem);
            console.log('depItem==> ' + depItem);
            let depDetail = lockDeps[depItem];
            if (depDetail == null) {
                console.log('depItem no found', depItem);
                continue;
            }
            let depReq = depDetail['requires'];
            if (depReq != null) {
                travelStack = travelStack.concat(_.difference(Object.keys(depReq), allPlatformDep));//difference防止循环依赖
            }
        }
        console.log('allPlatformDep: ' + JSON.stringify(allPlatformDep));
        return _.uniq(allPlatformDep);
    }


    let startPackage = () => {
        if (entry == null) {
            alert("请选择打包的js入口");
            return;
        }
        entrys = entry.split(",,");
        setEntryIndex(0)
        entryIndexRef.current = 0
        if (entrys.length > 0) {
            setEntryErrorIndex(0)
            setEntryErrorIndexs([])
            loopPackage();
        }
    }

    let startAndroidPackage = () => {
        setLoading(true)
        setCmdStr('')
        // let cmdStr = './android/gradlew assembleRelease'
        let assembleRelease = selectedChannel.cmd
        let cmdStr = 'chcp 65001 && ' + projDir + '\\android\\gradlew ' + assembleRelease

        setPackageStaus(1)
        let packageProcess = exec(cmdStr, { cwd: projDir + '\\android', encoding: 'buffer' }, (error, stdout, stderr) => {
            setLoading(false)
            if (error) {
                setPackageStaus(-1)
                message.error('打安装包出错！')
                console.error(`执行出错: ${iconv.decode(error.message, 'cp936')}`);
                setCmdStr(error)
                if (logTextRef.current) logTextRef.current.resizableTextArea.textArea.scrollTop = logTextRef.current.resizableTextArea.textArea.scrollHeight
                // return;
            } else {
                setPackageStaus(2)
                message.info('打安装包完成！')
            }
            console.log(`stdout: ${iconv.decode(stdout, 'CP936')}`);
            console.log(`stderr: ${iconv.decode(stderr, 'CP936')}`);
        });
        let cmdRetStrs = cmdStr
        packageProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
            cmdRetStrs += data;
            setCmdStr(cmdRetStrs)
            if (logTextRef.current) logTextRef.current.resizableTextArea.textArea.scrollTop = logTextRef.current.resizableTextArea.textArea.scrollHeight
            // console.log(logTextRef.current.resizableTextArea.textArea.scrollHeight)
        });
    }

    let loopPackage = () => {
        if (entryIndexRef.current >= entrys.length) {
            return;
        }
        const entry = entrys[entryIndexRef.current];
        console.log("*************** package  run  no ** " + (entryIndexRef.current + 1) + " pkg: " + entry);
        setCmdStr('')
        console.log("-----getModuleVersion----" + getModuleVersion(entry))
        let bundleName = bundleNameInput.input.value ||
            (stateRef.current.type == 'buz' ?
                (entry.substring(entry.lastIndexOf('index'), entry.indexOf('.js')) + `_V${versionInput.input.value || getModuleVersion(entry) || '0'}.android.bundle`)
                : 'platform.android.bundle');
        setBundleName(bundleName)
        console.log(stateRef.current.type + '------------------' + (bundleName))
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
            return
        }
        let bundleConifgName;
        let platformDepJsonPath = projDir + path.sep + 'platformDep.json';
        console.log('platformDepJsonPath--> ' + platformDepJsonPath)
        if (stateRef.current.type == 'base') {
            bundleConifgName = 'platform-ui.config.js';
            fs.writeFileSync(platformDepJsonPath, JSON.stringify(depsChecked), 'utf8');
            let platformDepImportPath = projDir + path.sep + 'platformDep-import.js';
            let importStr = '';
            depsChecked.forEach((moduleStr) => {
                importStr = importStr + 'import \'' + moduleStr + '\'\n';
            });
            fs.writeFileSync(platformDepImportPath, importStr, 'utf8');
        } else {
            bundleConifgName = 'buz-ui.config.js';
            const platformDepArray = require(platformDepJsonPath);
            if (!Array.isArray(platformDepArray)) {
                alert("必须先打基础包");
                return;//必须先打基础包
            }
            if (depsChecked.length > 0) {//需要过滤platformDepArray
                console.log('-----++> ' + packageLockFile)
                const packageLockObj = require(packageLockFile);
                const lockDeps = packageLockObj['dependencies'];
                console.log('start deal platform dep');
                let allPlatformDep = getAllDeps(platformDepArray, lockDeps);
                console.log('start deal buz dep');
                let allBuzDep = getAllDeps(depsChecked, lockDeps);
                let filteredBuzDep = _.difference(allBuzDep, allPlatformDep);
                let buzDepJsonPath = projDir + path.sep + 'buzDep.json';//业务包依赖的路径
                fs.writeFileSync(buzDepJsonPath, JSON.stringify(filteredBuzDep));//todo 打包脚本读取该数组
            }
        }
        let cmdStr = 'node ./node_modules/react-native/local-cli/cli.js bundle  --platform ' + platform
            + ' --dev ' + env + ' --entry-file ' + entry + ' --bundle-output ' + bundleDir + path.sep + bundleName
            + ' --assets-dest ' + assetsDir + ' --config ' + projDir + path.sep + bundleConifgName;
        console.log(cmdStr)
        setLoading(true)
        setCmd(cmdStr)
        // alert(cmdStr)
        let packageProcess = exec(cmdStr, { cwd: projDir }, (error, stdout, stderr) => {
            setLoading(false)
            if (error) {
                console.error(`执行出错: ${error}`);
                setEntryErrorIndex(entryErrorIndex++)
                let entryErrors = [...entryErrorIndexs]
                entryErrors.push(entry.substring(entry.lastIndexOf('index'), entry.indexOf('.js')))
                setEntryErrorIndexs(entryErrors)
                setCmdStr(error)
                if (logTextRef.current) logTextRef.current.resizableTextArea.textArea.scrollTop = logTextRef.current.resizableTextArea.textArea.scrollHeight
                // return;
            }
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            setEntryIndex(++entryIndexRef.current);
            loopPackage();
        });
        let cmdRetStrs = cmdStr
        packageProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
            cmdRetStrs += data;
            setCmdStr(cmdRetStrs)
            if (logTextRef.current) logTextRef.current.resizableTextArea.textArea.scrollTop = logTextRef.current.resizableTextArea.textArea.scrollHeight
        });

    }

    // zip 递归读取文件夹下的文件流
    let readDir = (zip, nowPath) => {
        // 读取目录中的所有文件及文件夹（同步操作）
        console.log('----------read-----------')
        let files = fs.readdirSync(nowPath)
        //遍历检测目录中的文件
        files.filter(name => !name.includes('.zip')).forEach((fileName, index) => {
            // 打印当前读取的文件名
            console.log(fileName, index)
            // 当前文件的全路径
            let fillPath = path.join(nowPath, fileName)
            // 获取一个文件的属性
            let file = fs.statSync(fillPath)
            // 如果是目录的话，继续查询
            if (file.isDirectory()) {
                // 压缩对象中生成该目录
                let dirlist = zip.folder(fileName)
                // （递归）重新检索目录文件
                readDir(dirlist, fillPath)
            } else {
                // 压缩目录添加文件
                zip.file(fileName, fs.readFileSync(fillPath))
            }
        })
        console.log('+---------read----------+')
    }

    let deleteDir = (nowPath) => {
        // 读取目录中的所有文件及文件夹（同步操作）
        let files = fs.readdirSync(nowPath)
        //遍历检测目录中的文件
        console.log('----------delete-----------')
        files.filter(name => !name.includes('.zip')).forEach((fileName, index) => {
            // 打印当前读取的文件名
            // 当前文件的全路径
            let fillPath = path.join(nowPath, fileName)
            // 获取一个文件的属性
            let file = fs.statSync(fillPath)
            // 如果是目录的话，继续查询
            if (file.isDirectory()) {
                // （递归）重新检索目录文件
                deleteDir(fillPath)
                fs.rmdirSync(fillPath)
                console.log(fileName)
            } else {
                // 删除文件
                fs.unlinkSync(fillPath)
                console.log(index + "---" + fileName)
            }
        })
        console.log('+---------delete----------+')
    }

    // 开始压缩文件
    let zipFolder = (target = __dirname, output = __dirname + '/result.zip') => {
        // 创建 zip 实例
        const zip = new JSZIP()
        // zip 递归读取文件夹下的文件流
        readDir(zip, target)
        // 设置压缩格式，开始打包
        zip.generateAsync({
            // nodejs 专用
            type: 'nodebuffer',
            // 压缩算法
            compression: 'DEFLATE',
            // 压缩级别
            compressionOptions: { level: 9, },
        }).then(content => {
            // 将打包的内容写入 当前目录下的 result.zip中
            fs.writeFileSync(output, content, 'utf-8')

        }).catch(e => {
            alert(e)
        })
    }

    let formatZero = (num, len) => {
        if (String(num).length > len) return num;
        return (Array(len).join(0) + num).slice(-len);
    }

    //更新Map版本号
    let updateModuleIdConfig = (inputValue) => {
        if (!inputValue) inputValue = '0'
        //只取两位
        if (inputValue && inputValue.length > 2) inputValue = inputValue.substring(0, 2)
        let configPath = curBinDirName + path.sep + 'multibundler' + path.sep + 'ModuleIdConfig.json'
        let json = fs.readFileSync(configPath, 'utf8')
        let config = JSON.parse(json)
        let selectFileName = entry + ''
        const id = selectFileName.substring(selectFileName.lastIndexOf('index') + 5, selectFileName.indexOf('.js'))
        config[selectFileName.substring(selectFileName.lastIndexOf('\\') + 1)] = Number(id + formatZero(inputValue, 2) + '000')
        let newJson = JSON.stringify(config, null, 2)
        // alert(newJson)
        fs.writeFileSync(configPath, newJson, 'utf8')
        fs.unlinkSync(curBinDirName + path.sep + 'multibundler' + path.sep + 'index' + id + 'Map.json')
    }

    //新增map
    let addModuleConfig = (newMoudle) => {
        if (newMoudle) {
            let configPath = curBinDirName + path.sep + 'multibundler' + path.sep + 'ModuleIdConfig.json'
            let json = fs.readFileSync(configPath, 'utf8')
            let config = JSON.parse(json)
            config[`index${newMoudle.id}.js`] = Number(newMoudle.id + '00000')
            let newJson = JSON.stringify(config, null, 2)
            fs.writeFileSync(configPath, newJson, 'utf8')
        }
    }

    //获取Map里面版本号
    let getModuleVersion = (selectFileName) => {
        let configPath = curBinDirName + path.sep + 'multibundler' + path.sep + 'ModuleIdConfig.json'
        let json = fs.readFileSync(configPath, 'utf8')
        let config = JSON.parse(json)
        console.log("selectFileName--->" + selectFileName)
        const moduleInfo = config[selectFileName.substring(selectFileName.lastIndexOf('\\') + 1)] + ""
        console.log("moduleInfo--->" + moduleInfo)
        return Number(moduleInfo.substring(moduleInfo.length - 5, moduleInfo.length - 3)) + ""
    }

    //清空原配置
    let cleanConfig = () => {
        let multibundlerPath = curBinDirName + path.sep + 'multibundler' + path.sep
        let mainConfig = multibundlerPath + 'platformMap.json'
        fs.writeFileSync(mainConfig, "[]", 'utf8')
        let files = fs.readdirSync(multibundlerPath)
        files.filter(name => name.includes('Map.json') && name.includes('index')).forEach((fileName, index) => {
            let fillPath = path.join(multibundlerPath, fileName)
            fs.unlinkSync(fillPath)
        })
        alert("清除完成，请重新打基础包和插件包")
    }

    let handleOk = () => {
        if (!modleName) {
            message.info('请输入模块名称！')
            return
        }
        if (!modlePermission) {
            message.info('请输入模块权限！')
            return
        }
        if (selectedSys) {
            let jsonPath = projDir + path.sep + 'android\\app\\src\\main\\assets\\data\\menu.json'
            let jsonStr = fs.readFileSync(jsonPath, 'utf8')
            let menuList = JSON.parse(jsonStr)
            if (selectedSys == 'prs') {
                selectedSys = 'Collection'
            } else {
                selectedSys = selectedSys.toLocaleUpperCase()
            }
            let newMoudle = { id: 0 }
            for (let menuInfo of menuList) {
                if (menuInfo.permission == selectedSys) {
                    // alert(JSON.stringify(menuInfo.childData, null, 2))
                    for (let menuChild of menuInfo.childData) {
                        if (menuChild.id >= newMoudle.id) {
                            newMoudle = {
                                childName: modleName,
                                permission: modlePermission,
                                parent: selectedSys,
                                resKey: 'model_' + modlePermission.replace(/([A-Z])/g, '_$1').toLocaleLowerCase(),
                                id: menuChild.id + 1,
                                version: 0
                            }
                        }
                    }
                    menuInfo.childData.push(newMoudle)
                }
            }
            fs.writeFileSync(jsonPath, JSON.stringify(menuList, null, 2), 'utf-8')
            let mSelectedSys = selectedSys.toLocaleLowerCase()
            if (mSelectedSys == 'cims') {
                mSelectedSys = 'cims2'
            }
            setSelectedSys(mSelectedSys)
            let clasePackageName = modlePermission.charAt(0).toLocaleLowerCase() + modlePermission.slice(1, modlePermission.indexOf('Page'))
            let classPath = projDir + path.sep + 'app\\page\\' + mSelectedSys + '\\' + clasePackageName
            if (!fs.existsSync(classPath))
                fs.mkdirSync(classPath)
            fs.writeFileSync(classPath + '\\index.tsx', "import React from 'react'" + '\n'
                + "import { NavigationContainer } from '@react-navigation/native';" + '\n'
                + "import { createStackNavigator } from '@react-navigation/stack';" + '\n'
                + "const Stack = createStackNavigator();" + '\n'
                + "const APP = (props: any) => {" + '\n'
                + "\treturn (" + '\n'
                + "\t\t<NavigationContainer>" + '\n'
                + "\t\t\t<Stack.Navigator>" + '\n'
                + "\t\t\t</Stack.Navigator>" + '\n'
                + "\t\t</NavigationContainer>" + '\n'
                + "\t);" + '\n'
                + "}" + '\n\n'
                + "export default APP;"
            )
            //新增map配置
            addModuleConfig(newMoudle)
            let indexPath = projDir + path.sep + 'indexs\\index' + newMoudle.id + '.js'
            fs.writeFileSync(indexPath, "import { AppRegistry } from 'react-native';" + '\n'
                + "import { AppWrapper } from '../baseApp';" + '\n'
                + "import " + modlePermission + " from '../app/page/" + mSelectedSys + '/' + modlePermission.charAt(0).toLocaleLowerCase() + modlePermission.slice(1) + "'\n"
                + "AppRegistry.registerComponent('yunexpress_app_" + newMoudle.id + "', () => AppWrapper(" + modlePermission + "));")

            let yunExpressIndexPath = projDir + path.sep + 'YunExpressIndex.js'
            let yunExpressIndexFile = fs.readFileSync(yunExpressIndexPath, 'utf8')
            // let codeLines = yunExpressIndexFile.split('\r')
            // for(let line of codeLines){
            // }
            let lastSysImportToEnd = yunExpressIndexFile.substring(yunExpressIndexFile.lastIndexOf('./app/page/' + mSelectedSys))
            let lastSysImport = lastSysImportToEnd.substring(0, lastSysImportToEnd.indexOf('\r'))

            let newImport = lastSysImport + '\r' + `import ${modlePermission} from './app/page/${mSelectedSys + '/' + clasePackageName}/index';`
            yunExpressIndexFile = yunExpressIndexFile.replace(lastSysImport, newImport)
            let constSysAppsFunciotnToEnd = yunExpressIndexFile.substring(yunExpressIndexFile.indexOf(`const ${mSelectedSys}Apps = {`))
            let constSysAppsFunciotn = constSysAppsFunciotnToEnd.substring(0, constSysAppsFunciotnToEnd.indexOf('}'))
            let newFuncion = constSysAppsFunciotn + `	yunexpress_app_${newMoudle.id}: ${modlePermission}, //${modleName}\r`
            yunExpressIndexFile = yunExpressIndexFile.replace(constSysAppsFunciotn, newFuncion)
            fs.writeFileSync(yunExpressIndexPath, yunExpressIndexFile, 'utf-8')
            message.info('创建模块成功')
        } else {
            message.info('请选择系统！')
            return
        }
        setSelectedSys(undefined)
        setVisible(false)
    }

    let handleCancel = () => {
        setSelectedSys(undefined)
        setVisible(false)
    }

    /**
     * 获取打包按钮属性
     */
    let getPackageBtnText = () => {
        let btnText = { name: '打安装包', color: '#555' }
        switch (packageStaus) {
            case 0:
            case 1:
                btnText = { name: '打安装包', color: '#555' }
                break
            case 2:
                btnText = { name: '打包成功', color: 'green' }
                break
            case -1:
                btnText = { name: '打包失败', color: 'red' }
                break
        }
        return btnText;
    }

    let getModules = () => {
        let json = fs.readFileSync(projDir + path.sep + 'android\\app\\src\\main\\assets\\data\\menu.json', 'utf8')
        let obj = JSON.parse(json)
        const subColumns = [
            {
                title: '功能',
                dataIndex: 'childName',
                key: 'childName',
                render: (data) => <a>{data}</a>
            },
            {
                title: 'ID',
                dataIndex: 'id',
                key: 'id',
                sorter: (a, b) => a.id - b.id,
            },
            {
                title: '权限',
                dataIndex: 'permission',
                key: 'permission',
            },
        ]
        const columns = [
            {
                title: '系统',
                dataIndex: 'groupName',
                key: 'groupName',
            },
            {
                title: '权限',
                dataIndex: 'permission',
                key: 'permission',
            },
            {
                title: 'Key',
                dataIndex: 'resKey',
                key: 'resKey',
            },
            // {
            //     title: '模块',
            //     dataIndex: 'childData',
            //     key: 'childData',
            //     // render: (data) => {
            //     //     return <Table columns={subColumns} dataSource={data} />
            //     // }
            // },
        ]
        return (
            <Table
                bordered
                columns={columns}
                pagination={false}
                dataSource={obj}
                rowKey={'resKey'}
                expandable={{
                    expandedRowRender: (data) => <Table bordered size={'small'} rowKey={'resKey'} pagination={false} columns={subColumns} dataSource={data.childData} />,
                    rowExpandable: (data) => data.childData != null,
                    expandRowByClick: true
                }}
            />
        )
    }

    return (
        <div style={{ paddingLeft: 30, paddingTop: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                {renderItem('平台', renderPlatformSelect())}
                {renderItem('环境', renderEnvSelect())}
                {renderItem('类型', renderTypeSelect())}
            </div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                {renderItema('入口', renderFileSelect('entry'))}
                <div style={{ width: '20px' }} ></div>
                {stateRef.current.type == 'buz' ? renderItem('版本', <Input disabled={!entry || (entry && entry.includes(',,'))} ref={ref => versionInput = ref} onChange={(e) => {
                    if (e.target.value) {
                        setAssetsDir(curBinDirName + '\\remotebundles')
                        setBundleDir(curBinDirName + '\\remotebundles')
                    } else {
                        setAssetsDir(projDir + path.sep + 'android\\app\\src\\main\\res')
                        setBundleDir(projDir + path.sep + 'android\\app\\src\\main\\assets')
                    }
                    updateModuleIdConfig(e.target.value)
                }} />) : null}

            </div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                {renderItem('bundle目录', renderFileSelect('bundle'))}
                {renderItem('bundle名称(可不填)', renderBundleName())}
            </div>
            {renderItem('assets目录', renderFileSelect('assets'))}

            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <Button style={{ marginTop: 12, marginLeft: 10, width: 100, color: '#555' }} onClick={() => {
                    let newDep = []
                    for (let dep of deps) {
                        if (typeof dep == 'string') {
                            newDep.push(dep)
                        }
                    }
                    if (stateRef.current.type == 'buz') {
                        if ((depsChecked.length == 2 && depsChecked[0] == 'react' && depsChecked[1] == 'react-native')) {
                            setDepsChecked([])
                        }
                        if (!depsChecked || depsChecked.length == 0) {
                            if ((newDep.length == 2 && newDep[0] == 'react' && newDep[1] == 'react-native')) {
                                newDep = []
                            }
                            setDepsChecked(newDep)
                        }
                        else {
                            setDepsChecked([])
                        }
                    } else {
                        if (depsChecked && depsChecked.length == 2
                            && depsChecked[0] == 'react' && depsChecked[1] == 'react-native') {
                            setDepsChecked(['react', 'react-native', ...newDep])
                        } else {
                            setDepsChecked(['react', 'react-native'])
                        }
                    }
                }}>全选</Button>
                <Button style={{ marginTop: 12, marginLeft: 10, width: 100, color: '#555' }} onClick={() => {
                    alert(JSON.stringify(depsChecked, null, 2))
                }}>查看选择</Button>
                <Button style={{ marginTop: 12, marginLeft: 10, width: 120, color: '#555' }} onClick={() => {
                    remote.shell.openItem(bundleDir)
                }}>跳转打包目录</Button>
                {stateRef.current.type == 'buz' ? <Button style={{ marginTop: 12, marginLeft: 10, width: 130, color: '#555' }} onClick={() => {
                    // remote.shell.openItem(curBinDirName + '\\remotebundles')
                    const packageDir = curBinDirName + '\\remotebundles\\'
                    fs.readdir(curBinDirName + '\\remotebundles\\drawable-mdpi', 'utf8', (e, files) => {
                        // alert(JSON.stringify(files, null, 2))
                        fs.readdir(curBinDirName + '\\android\\app\\src\\main\\res\\drawable-mdpi', 'utf8', (e, resFiles) => {
                            let zipRes = []
                            files && files.forEach((file) => {
                                if (resFiles.includes(file)) {
                                    fs.unlinkSync(curBinDirName + '\\remotebundles\\drawable-mdpi\\' + file)
                                } else {
                                    zipRes.push(file)
                                }
                            })
                            zipFolder(packageDir,
                                packageDir + (bundleName || (entry.substring(entry.lastIndexOf('index'), entry.indexOf('.js')) + `_V${versionInput.input.value || '0'}.android.bundle`)) + '.zip')
                            deleteDir(packageDir)
                        })
                    })
                }}>生成插件更新包</Button> :
                    <Button style={{ marginTop: 12, marginLeft: 10, width: 120, color: '#555' }} onClick={() => {
                        cleanConfig()
                    }}>清空原来配置</Button>
                }
                <Button style={{ marginTop: 12, marginLeft: 10, width: 120, color: '#555' }} onClick={() => {
                    showDrawer()
                }}>查看模块详情</Button>
                <Button style={{ marginTop: 12, marginLeft: 10, width: 100, color: '#555' }} onClick={() => {
                    setVisible(true)
                }}>新增模块</Button>
            </div>
            <div style={{ marginTop: '12px' }}>模块依赖:</div>
            {renderItem(null, renderDep())}
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Button style={{ marginLeft: 10, marginRight: 10, width: 100, color: '#555' }} loading={loading} onClick={startPackage}>打RN包</Button>
                <div style={{ color: entryErrorIndex ? 'red' : 'green' }}>{'打包总共' + entrys.length + '个：成功' + (entryIndex - entryErrorIndex) + '个，失败' + entryErrorIndex + '个' + (entryErrorIndex ? '，失败index-->' + JSON.stringify(entryErrorIndexs) : '')}</div>
            </div>
            <div style={{ flexDirection: 'row', display: 'flex', alignItems: 'center' }}>
                <Button style={{ marginLeft: 10, marginRight: 10, marginTop: 10, width: 100, color: getPackageBtnText().color }} loading={loading} onClick={startAndroidPackage}>
                    {getPackageBtnText().name}
                </Button>
                <div style={{ flexDirection: 'row', alignItems: 'center', marginTop: '10px' }}>
                    <text style={{ color: '#555' }}>打包渠道：</text>
                    <Dropdown overlay={channel} trigger={['click']} selectable>
                        <Space>
                            {selectedChannel.label || '请选择渠道'}
                            <DownOutlined />
                        </Space>
                    </Dropdown>
                </div>
                <Button style={{ marginLeft: 10, marginRight: 10, marginTop: 10, width: 130, color: '#555' }} onClick={() => {
                    if (!remote.shell.openItem(projDir + selectedChannel.dir)) {
                        message.info('目录文件不存在，请先打安装包！')
                    }
                }}>跳转安装包目录</Button>
                <Button style={{ marginLeft: 10, marginRight: 10, marginTop: 10, width: 100, color: '#555' }} onClick={() => {
                    // message.info('正在上传，请稍候...')
                    props.goUpload && props.goUpload()
                }}>上传</Button>
            </div>
            <div>{cmd}</div>
            <TextArea ref={logTextRef} value={cmdStr} rows={10} readonly={true} style={{ marginTop: 12, width: 1200 }} />
            <Modal
                title="新增模块"
                visible={visible}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={handleCancel}>返回</Button>,
                    <Button key="submit" type="primary" onClick={handleOk}>创建</Button>
                ]}
            >
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <text style={{ color: '#555' }}>模块名称：</text>
                    <Input style={{ flex: 1 }} onChange={(e) => {
                        if (e.target) {
                            setModleName(e.target.value)
                        }
                    }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: '10px' }}>
                    <text style={{ color: '#555' }}>模块权限：</text>
                    <Input style={{ flex: 1 }} onChange={(e) => {
                        if (e.target) {
                            setModlePermission(e.target.value)
                        }
                    }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: '10px' }}>
                    <text style={{ color: '#555' }}>模块系统：</text>
                    <Dropdown overlay={menu} trigger={['click']} selectable>
                        <Space>
                            {selectedSys || '请选择系统'}
                            <DownOutlined />
                        </Space>
                    </Dropdown>
                </div>
            </Modal >
            <Drawer title="模块信息" width={700} placement="right" onClose={onClose} open={open}>
                {getModules()}
            </Drawer>
        </div >
    )
}