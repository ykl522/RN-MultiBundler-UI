/*
 * @Author: 康乐 yuankangle@gmail.com
 * @Date: 2021-07-02 14:48:11
 * @LastEditors: 康乐 yuankangle@gmail.com
 * @LastEditTime: 2024-05-28 09:41:46
 * @FilePath: \RN-MultiBundler-UI\src\index.js
 * @Description: 入口
 */
import { app, BrowserWindow, Menu, ipcMain, shell } from "electron";
import { enableLiveReload } from "electron-compile";
import { workSpace } from "./config";
import path from "path";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, loadingWindow;
process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
  // application specific logging, throwing an error, or other logic here
});
const isDevMode = process.execPath.match(/[\\/]electron/);

if (isDevMode) enableLiveReload({ strategy: "react-hmr" });

// 添加全局异常捕获
process.on('uncaughtException', (error) => {
  alert('未捕获的异常:' + error);
  // 可以将错误日志写入文件或发送到远程服务器
  // 例如: fs.appendFileSync('error.log', `${new Date().toISOString()}: ${error.stack}\n`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);
  // 可以将错误日志写入文件或发送到远程服务器
});

const createLoadingWindow = () => {
  try {
    loadingWindow = new BrowserWindow({
      width: 600,
      height: 300,
      useContentSize: true,
      show: true,
      maximizable: false, //禁止双击放大
      frame: false, //去掉顶部操作栏
    });
    loadingWindow.loadURL("file://" + __dirname + "/loading.html");
    Menu.setApplicationMenu(null);
    loadingWindow.on("closed", () => {
      loadingWindow = null;
    });
  } catch (error) {
    error && console.log(error);
  }
};

const createWindow = async () => {
  try {
    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: 1500,
      height: 1000,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        sandbox: false,
        preload: path.resolve(__dirname, "preload.js"),
      },
    });
    const exeDir = path.dirname(app.getPath("exe")).replace(/\\/g, "/");
    const fs = require("fs");
    let configObj = {};
    if (fs.existsSync(`${exeDir}/config.json`)) {
      const config = fs.readFileSync(`${exeDir}/config.json`);
      console.log("config------index.js-------->" + config);
      if (config) {
        configObj = JSON.parse(config);
      }
    }
    const helpMenu = [
      {
        label: "访问开发调试目录",
        click: async () => {
          const { shell } = require("electron");
          await shell.openExternal(
            "D:/Git/RN-MultiBundler-UI/node_modules/electron-prebuilt-compile/node_modules/electron/dist/"
          );
        },
      },
      {
        label: "访问Electron官网",
        click: async () => {
          const { shell } = require("electron");
          await shell.openExternal(
            "https://www.electronjs.org/docs/latest/api/app"
          );
        },
      },
      {
        label: "访问工具Github地址",
        click: async () => {
          const { shell } = require("electron");
          await shell.openExternal(
            "https://github.com/ykl522/RN-MultiBundler-UI"
          );
        },
      },
      {
        label: "看板娘",
        click: async () => {
          mainWindow.webContents.executeJavaScript(
            require("./external/autoload").kbn
          );
        },
      },
      {
        label: "九宫格",
        click: async () => {
          mainWindow.webContents.send("JGGViewSwitch");
        },
      },
      {
        label: "关于",
        click: async () => {
          const { dialog } = require("electron");
          await dialog.showMessageBox({
            title: "关于",
            message: `云途APP开发工具\n版本号：${app.getVersion()}\n作者：🐒🌱😊`,
            type: "info",
          });
        },
      },
    ].filter((item) =>
      configObj.permission
        ? true
        : item.label !== "看板娘" && item.label !== "九宫格"
    );
    // 菜单栏模板
    const menuBar = [
      {
        label: "文件",
        submenu: [
          {
            label: "打开",
            click: async (event, focusedWindow, focusedWebContents) => {
              const { dialog } = require("electron");
              let openType = "openDirectory";
              let filter = undefined;
              let title = "清选择RN工程目录";
              await dialog.showOpenDialog(
                focusedWindow,
                {
                  defaultPath: workSpace,
                  title: title,
                  buttonLabel: "选择",
                  filters: filter,
                  properties: [openType],
                },
                (filePath) => {
                  if (filePath) {
                    const directory = filePath[0];
                    mainWindow.webContents.send("changeDir", directory);
                    console.log("选择: " + directory);
                  }
                }
              );
            },
          },
          {
            label: "设置",
            click: async () => {
              mainWindow.webContents.send("settings");
            },
          },
          { label: "退出", role: "quit" },
        ].filter((item) => (configObj.permission ? true : item.label !== "设置")),
      },
      {
        label: "预定义功能",
        submenu: [
          {
            label: "打开开发者工具",
            role: "toggledevtools",
          },
          {
            label: "全屏",
            role: "togglefullscreen",
          },
          {
            label: "重新加载",
            role: "reload",
          },
          {
            label: "编辑",
            role: "editMenu",
          },
          {
            label: "窗口",
            role: "windowMenu",
          },
        ],
      },
      {
        label: "帮助",
        submenu: helpMenu,
      },
    ];

    // 构建菜单项
    const menu = Menu.buildFromTemplate(menuBar);
    // 设置一个顶部菜单栏
    Menu.setApplicationMenu(menu);
    // and load the index.html of the app.
    var url = "file://" + __dirname + "/index.html";
    mainWindow.loadURL(url);
    // Open the DevTools.
    if (isDevMode) {
      mainWindow.webContents.openDevTools();
    }

    // Emitted when the window is closed.
    mainWindow.on("closed", () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null;
    });
  } catch (error) {
    error && console.log(error);
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createLoadingWindow();
  createWindow();
  ipcMain.on("close-loading-window", (_e, res) => {
    if (res && res.isClose) {
      if (loadingWindow) loadingWindow.close();
      if (mainWindow) mainWindow.show();
    }
    mainWindow.webContents.send(
      "ExePath",
      path.dirname(app.getPath("exe")).replace(/\\/g, "/")
    );
    mainWindow.webContents.send("DownloadPath", app.getPath("downloads"));
  });
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
