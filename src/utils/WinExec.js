/*
 * @Author: 康乐 yuankangle@gmail.com
 * @Date: 2023-02-02 09:36:39
 * @LastEditors: 康乐 yuankangle@gmail.com
 * @LastEditTime: 2023-04-20 14:12:09
 * @FilePath: \RN-MultiBundler-UI\src\utils\WinExec.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export default class WinExec {

    /**
     * 执行cmd命令
     * @param {string} cmdStr     执行指令  
     * @param {string?} cmdPath    命令执行目录
     * @param {Function?} callback 执行结果回调
     * @param {Function?} finishCallback 完成时回调 包含成功和失败
     */
    static cmd(cmdStr, cmdPath, callback, finishCallback) {
        console.log('执行命令：' + cmdStr)
        return new Promise((resolve, rejects) => {
            try {
                const { exec } = require('child_process');
                const iconv = require('iconv-lite')
                let packageProcess = exec(cmdStr, { cwd: cmdPath, encoding: 'buffer' }, (error, stdout, stderr) => {
                    if (error) {
                        rejects(iconv.decode(stderr, 'CP936'))
                        console.error(`命令执行出错: ${iconv.decode(stderr, 'CP936')}`);
                        if (finishCallback) finishCallback(false, iconv.decode(stderr, 'CP936'))
                    } else {
                        console.log(`命令执行完成: ${iconv.decode(stderr, 'CP936')}`);
                        // 命令执行完成
                        resolve('CmdExeFinish')
                        if (finishCallback) finishCallback(true, iconv.decode(stderr, 'CP936'))
                    }
                    console.log(`stdout: ${iconv.decode(stdout, 'CP936')}`);
                    console.log(`stderr: ${iconv.decode(stderr, 'CP936')}`);
                });
                let cmdRetStrs = cmdStr
                packageProcess.stdout.on('data', (data) => {
                    // data = iconv.decode(data, 'utf8')
                    console.log(`result--> ${data}`);
                    resolve(data)
                    callback && callback(data)
                    cmdRetStrs += data;
                });
            } catch (error) {
                console.error('error=> ' + error)
            }
        })
    }
}