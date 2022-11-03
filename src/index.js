/*
 * @Author: 袁康乐 yuankangle@yunexpress.cn
 * @Date: 2021-07-02 14:48:11
 * @LastEditors: 袁康乐 yuankangle@yunexpress.cn
 * @LastEditTime: 2022-10-28 09:33:09
 * @FilePath: \RN-MultiBundler-UI\src\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const { app, BrowserWindow } = require('electron');
const { REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');
const installExtension = require('electron-devtools-installer').default;
const { enableLiveReload } = require('electron-compile');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});
const isDevMode = process.execPath.match(/[\\/]electron/);

if (isDevMode) enableLiveReload({ strategy: 'react-hmr' });

const createWindow = async () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 1000,
    webPreferences: { nodeIntegration: true, preload: __dirname + '/preload.js' }
  });
  // and load the index.html of the app.
  var url = 'file://' + __dirname + '/index.html';
  mainWindow.loadURL(url);
  // Open the DevTools.
  if (isDevMode) {
    await installExtension(REACT_DEVELOPER_TOOLS);
    mainWindow.webContents.openDevTools();
    require('devtron').install()
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
app.on('ready', createWindow);

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
