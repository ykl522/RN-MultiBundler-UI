export default class WinExec {

    /**
     * 执行cmd命令
     * @param {string} cmdStr     执行指令  
     * @param {string?} cmdPath    命令执行目录
     * @param {Function?} callback 成功时回调
     */
    static cmd(cmdStr, cmdPath, callback) {
        return new Promise((resolve, rejects) => {
            const { exec } = require('child_process');
            let packageProcess = exec(cmdStr, { cwd: cmdPath, encoding: 'buffer' }, (error, stdout, stderr) => {
                const iconv = require('iconv-lite')
                if (error) {
                    rejects(iconv.decode(stderr, 'CP936'))
                    console.error(`执行出错: ${iconv.decode(stderr, 'CP936')}`);
                } else {
                    // 命令执行完成
                    resolve('CmdExeFinish')
                }
                console.log(`stdout: ${iconv.decode(stdout, 'CP936')}`);
                console.log(`stderr: ${iconv.decode(stderr, 'CP936')}`);
            });
            let cmdRetStrs = cmdStr
            packageProcess.stdout.on('data', (data) => {
                console.log(`result--> ${data}`);
                resolve(data)
                callback && callback(data)
                cmdRetStrs += data;
            });
        })
    }
}