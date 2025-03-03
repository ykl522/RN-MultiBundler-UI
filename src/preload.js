/*
 * @Author: 袁康乐 yuankangle@gmail.com
 * @Date: 2022-11-03 14:37:26
 * @LastEditors: 袁康乐 yuankangle@gmail.com
 * @LastEditTime: 2022-11-10 11:26:48
 * @FilePath: \RN-MultiBundler-UI\src\preload.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge && contextBridge.exposeInMainWorld("api",
    {
        send: (channel, data) => {
            ipcRenderer.sendSync(channel, data);
        },
        on: (channel, data) => {
            ipcRenderer.on(channel, data);
        },
    }
);
