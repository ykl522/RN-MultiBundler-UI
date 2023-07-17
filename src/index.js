/*
 * @Author: 袁康乐 yuankangle@yunexpress.cn
 * @Date: 2021-07-02 14:48:11
 * @LastEditors: 康乐 yuankangle@yunexpress.cn
 * @LastEditTime: 2023-05-18 17:45:35
 * @FilePath: \RN-MultiBundler-UI\src\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const { REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');
const installExtension = require('electron-devtools-installer').default;
const { enableLiveReload } = require('electron-compile');
import { workSpace } from './config'
import path from 'path'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, loadingWindow;
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});
const isDevMode = process.execPath.match(/[\\/]electron/);

if (isDevMode) enableLiveReload({ strategy: 'react-hmr' });

const createLoadingWindow = () => {
  loadingWindow = new BrowserWindow({
    width: 600,
    height: 300,
    useContentSize: true,
    show: true,
    maximizable: false, //禁止双击放大
    frame: false //去掉顶部操作栏
  })
  loadingWindow.loadURL('file://' + __dirname + '/loading.html')
  Menu.setApplicationMenu(null)
  loadingWindow.on('closed', () => {
    loadingWindow = null
  })
}

const createWindow = async () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 1000,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false,
      preload: path.resolve(__dirname, 'preload.js')
    }
  });
  // 菜单栏模板
  const menuBar = [
    {
      label: '文件',
      submenu: [
        {
          label: '打开', click: async (event, focusedWindow, focusedWebContents) => {
            const { dialog } = require('electron');
            let openType = 'openDirectory';
            let filter = undefined;
            let title = '清选择RN工程目录';
            await dialog.showOpenDialog(
              focusedWindow,
              {
                defaultPath: workSpace,
                title: title,
                buttonLabel: '选择',
                filters: filter,
                properties: [openType]
              },
              (filePath) => {
                if (filePath) {
                  const directory = filePath[0];
                  mainWindow.webContents.send('changeDir', directory)
                  console.log('选择: ' + directory)
                }
              }
            )
          }
        },
        { label: '退出', role: 'quit' }
      ]
    },
    {
      label: '预定义功能',
      submenu: [
        {
          label: '打开开发者工具',
          role: 'toggledevtools'
        },
        {
          label: '全屏',
          role: 'togglefullscreen'
        },
        {
          label: '重新加载',
          role: 'reload'
        },
        {
          label: '编辑',
          role: 'editMenu'
        },
        {
          label: '窗口',
          role: 'windowMenu'
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '访问Electron官网', click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://www.electronjs.org/docs/latest/api/app')
          }
        },
        {
          label: '访问工具Github地址', click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://github.com/ykl522/RN-MultiBundler-UI')
          }
        },
        {
          label: '看板娘', click: async () => {
            mainWindow.webContents.executeJavaScript(require('./external/autoload').kbn)
          }
        },
        {
          label: '关于', click: async () => {
            const { dialog } = require('electron')
            await dialog.showMessageBox({ title: "关于", message: '云途APP开发工具\n版本号：1.0.1', type: 'info' })
          }
        }
      ]
    }
  ];

  // 构建菜单项
  const menu = Menu.buildFromTemplate(menuBar);
  // 设置一个顶部菜单栏
  Menu.setApplicationMenu(menu);
  // and load the index.html of the app.
  var url = 'file://' + __dirname + '/index.html';
  mainWindow.loadURL(url);
  // Open the DevTools.
  if (isDevMode) {
    await installExtension(REACT_DEVELOPER_TOOLS);
    mainWindow.webContents.openDevTools();
    // require('devtron').install()
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createLoadingWindow()
  createWindow()
  ipcMain.on('close-loading-window', (_e, res) => {
    if (res && res.isClose) {
      if (loadingWindow)
        loadingWindow.close()
      if (mainWindow)
        mainWindow.show()
    }
  })
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
