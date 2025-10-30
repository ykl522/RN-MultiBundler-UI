/*
 * @Author: 康乐 yuankangle@gmail.com
 * @Date: 2021-07-02 14:48:11
 * @LastEditors: 康乐 yuankangle@gmail.com
 * @LastEditTime: 2024-05-28 09:44:59
 * @FilePath: \ops_pdad:\Git\RN-MultiBundler-UI\src\app.jsx
 * @Description: 首页
 */
import React from "react";
const { ipcRenderer } = require("electron");
import { workSpace } from "./config";
import LanguageView from "./page/LanguageView";
import PackageView from "./page/PackageView";
import QRCodeView from "./page/QRCodeView";
import ApiView from "./page/ApiView";
import YapiJson2Ts from "./page/YapiJson2Ts";
import FileMd5View from "./page/FileMd5View";
import ApkView from "./page/ApkView";
import ProjectView from "./page/ProjectView";
import LogView from "./page/LogView";
import JGGView from "./page/JGGView";
import InterfaceView from "./page/InterfaceView";
import AIView from "./page/AIView";
import { Modal, Tabs, Table, Button, Input, Typography, Tooltip } from "antd";
import UtilsView from "./page/UtilsView";
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: "item-1",
      showJJG: false,
      showSettings: false,
      showOperation: 0, // 0 不显示 1 新增 2 编辑
      currentSetting: {},
      projDir: workSpace,
      permission: "1",
      deepSeekKey: "",
      uploadUrl: "",
      downloadPath: "",
      downloadMd5Data: {},
      dataSource: [
        { key: "projDir", value: workSpace, isDefault: true, tip: "项目目录" },
        { key: "permission", value: 1, isDefault: true, tip: "权限" },
        {
          key: "deepSeekKey",
          value: "",
          isDefault: true,
          tip: "DeepSeek API Key",
        },
        { key: "uploadUrl", value: "", isDefault: true, tip: "上传接口地址" },
      ],
    };
    this.configPath = "";
  }

  // 数组转json
  arrayToJson(arr) {
    if (arr == null || !Array.isArray(arr)) {
      return {}; // 如果不是数组，则直接返回
    }
    return arr.reduce((acc, item) => {
      acc[item.key] = item.value; // 将每个对象的 key 和 value 添加到结果对象中
      return acc;
    }, {});
  }

  componentDidMount() {
    ipcRenderer.send("close-loading-window", {
      isClose: true,
    });
    ipcRenderer.on("JGGViewSwitch", (event) => {
      console.log("=======JGGViewSwitch========");
      this.setState({ showJJG: !this.state.showJJG });
    });
    ipcRenderer.on("settings", (event) => {
      console.log("=======settings========");
      this.setState({ showSettings: !this.state.showSettings });
    });
    ipcRenderer.on("DownloadPath", (event, downloadPath) => {
      console.log("downloadPath------app.jsx-------->" + downloadPath);
      this.setState({ downloadPath });
    });
    ipcRenderer.on("ExePath", (event, exePath) => {
      console.log("ExePath------app.jsx-------->" + exePath);
      //拼接好安装目录下的config.json
      this.configPath = `${exePath}/config.json`;
      //使用fs读取文件内容
      const fs = require("fs");
      fs.readFile(this.configPath, "utf-8", (err, data) => {
        try {
          if (data) {
            //注意要转换json
            const config = JSON.parse(data);
            console.log("config-------------->" + JSON.stringify(config));
            if (config) {
              console.log("config.dir-------------->" + config.dir);
              this.state.projDir = config.dir || workSpace;
              this.state.permission = config.permission || 1;
              this.state.deepSeekKey = config.deepSeekKey || "";
              this.state.uploadUrl = config.uploadUrl || "";
              this.state.downloadMd5Data = config.downloadMd5Data || {};
              this.state.dataSource = [
                {
                  key: "projDir",
                  value: config.dir || "",
                  isDefault: true,
                  tip: "项目目录",
                },
                {
                  key: "permission",
                  value: config.permission || 1,
                  isDefault: true,
                  tip: "权限",
                },
                {
                  key: "deepSeekKey",
                  value: config.deepSeekKey || "",
                  isDefault: true,
                  tip: "DeepSeek API Key",
                },
                {
                  key: "uploadUrl",
                  value: config.uploadUrl || "",
                  isDefault: true,
                  tip: "上传接口地址",
                },
              ];
              this.setState({
                projDir: config.dir || "",
                permission: config.permission || 1,
                deepSeekKey: config.deepSeekKey || "",
                uploadUrl: config.uploadUrl || "",
                dataSource: this.state.dataSource,
              });
            }
          }
        } catch (error) {
          console.error("error----------->" + error);
        }
      });
    });
  }

  componentUnMount() {
    if (ipcRenderer) {
      ipcRenderer.removeAllListeners("JGGViewSwitch");
      ipcRenderer.removeAllListeners("settings");
      ipcRenderer.removeAllListeners("DownloadPath");
      ipcRenderer.removeAllListeners("ExePath");
    }
  }

  /**
   * 检查是否有权限 permissionValue: 全部13个模块权限为2^13-1=8191
   * 也可以这样计算：1|2|4|8|16|32|64|128|256|512|1024|2048|4096 = 8191，多个模块权限值取或运算
   * @param {*} permissionValue config.json文件中设置的权限值
   * @param {*} moduleId 模块ID 为2的指数值
   * @returns
   */
  hasPermission(permissionValue, moduleId) {
    return (permissionValue & moduleId) === moduleId;
  }

  render() {
    const items = [
      {
        label: "打包",
        key: "item-1",
        children: (
          <PackageView
            goUpload={() => {
              this.setState({ activeKey: "item-4" });
            }}
          />
        ),
      },
      {
        label: "多语言",
        key: "item-2",
        children: <LanguageView projDir={this.state.projDir} />,
      },
      { label: "二维码", key: "item-3", children: <QRCodeView /> },
      {
        label: "接口",
        key: "item-4",
        children: <ApiView uploadUrl={this.state.uploadUrl} />,
      },
      { label: "YAPI转TS", key: "item-5", children: <YapiJson2Ts /> },
      {
        label: "MD5",
        key: "item-6",
        children: (
          <FileMd5View
            downloadPath={this.state.downloadPath}
            downloadMd5Data={this.state.downloadMd5Data}
          />
        ),
      },
      {
        label: "APK",
        key: "item-7",
        children: <ApkView tabChangeKey={this.state.activeKey} />,
      },
      {
        label: "项目管理",
        key: "item-8",
        children: <ProjectView tabChangeKey={this.state.activeKey} />,
      },
      // { label: '模板', key: 'item-9', children: <ModelView /> },
      {
        label: "安卓日志",
        key: "item-9",
        children: <LogView tabChangeKey={this.state.activeKey} />,
      },
      { label: "接口提取", key: "item-10", children: <InterfaceView /> },
      {
        label: "DeepSeek",
        key: "item-11",
        children: <AIView deepSeekKey={this.state.deepSeekKey} />,
      },
      { label: "其他工具", key: "item-12", children: <UtilsView /> },
    ];
    if (this.state.showJJG) {
      items.push({ label: "九宫格", key: "item-13", children: <JGGView /> });
    }
    let newItems = [];
    if (this.state.permission) {
      newItems = items.filter((item) => {
        const id = Number(item.key.substring(item.key.indexOf("-") + 1));
        return this.hasPermission(Number(this.state.permission), 1 << (id - 1));
      });
    }
    return (
      <div>
        <Tabs
          tabBarStyle={{ paddingLeft: 30 }}
          items={newItems}
          activeKey={this.state.activeKey}
          onChange={(activeKey) => {
            this.setState({ activeKey });
          }}
        />
        <Modal
          title="设置"
          open={this.state.showSettings}
          width={800}
          okText="保存"
          cancelText="取消"
          onOk={() => {
            this.setState({ showSettings: false });
            const result = this.arrayToJson(this.state.dataSource);
            const fs = require("fs");
            if (fs.existsSync(this.configPath)) {
              fs.writeFile(this.configPath, JSON.stringify(result), (err) => {
                if (err) {
                  console.error("写入文件失败:", err);
                } else {
                  console.log("写入文件成功");
                  this.setState({
                    projDir: result.projDir,
                    permission: result.permission,
                    deepSeekKey: result.deepSeekKey,
                    uploadUrl: result.uploadUrl,
                  });
                }
              });
            }
          }}
          onCancel={() => {
            this.setState({ showSettings: false });
          }}
        >
          {/* <Button
						onClick={() => {

						}}
						type="primary"
						style={{
							marginBottom: 16,
						}}
					>
						新增配置项
					</Button> */}
          <Table
            columns={[
              {
                title: "配置项",
                dataIndex: "key",
                key: "key",
                render: (text, record) => {
                  return <Tooltip title={record.tip}>{text}</Tooltip>;
                },
              },
              {
                title: "值",
                dataIndex: "value",
                key: "value",
                editable: true,
                onCell: (record) => ({ record }),
              },
              {
                title: "操作",
                dataIndex: "operation",
                key: "operation",
                width: "20%",
                render: (text, record) => {
                  return (
                    <span>
                      {!record.isDefault ? (
                        <a
                          style={{ marginRight: 8 }}
                          onClick={() => {
                            console.log("record------->", record);
                          }}
                        >
                          删除
                        </a>
                      ) : null}
                      <a
                        onClick={() => {
                          console.log("record------->", record);
                          this.setState({
                            showOperation: 2,
                            currentSetting: record,
                          });
                        }}
                      >
                        编辑
                      </a>
                    </span>
                  );
                },
              },
            ]}
            dataSource={this.state.dataSource}
            bordered
            pagination={false}
          />
        </Modal>
        <Modal
          title="修改配置项"
          open={this.state.showOperation}
          width={600}
          style={{
            top: 200,
          }}
          okText="确认"
          cancelText="取消"
          onOk={() => {
            const { cloneDeep } = require("lodash");
            const updatedDataSource = this.state.dataSource.map((item) => {
              console.log("item------->", item);
              if (item.key === this.state.currentSetting.key) {
                item.value = this.state.currentSetting.value;
              }
              return item;
            });
            this.setState(
              {
                showOperation: 0,
                dataSource: cloneDeep(updatedDataSource),
              },
              () => {
                console.log("数据源已更新:", this.state.dataSource);
              }
            );
          }}
          onCancel={() => {
            this.setState({ showOperation: 0 });
          }}
        >
          <div>
            <Typography.Title level={5}>
              {this.state.currentSetting.key}
            </Typography.Title>
            <Input
              value={this.state.currentSetting.value}
              placeholder="请输入值"
              onChange={(e) => {
                this.state.currentSetting.value = e.target.value;
                this.setState({
                  currentSetting: {
                    key: this.state.currentSetting.key,
                    value: e.target.value,
                  },
                });
              }}
            />
          </div>
        </Modal>
      </div>
    );
  }
}

module.exports = App;
