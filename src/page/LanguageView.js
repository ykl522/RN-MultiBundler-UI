import { useState, useEffect } from 'react';
const { exec } = require('child_process');
const fs = require("fs");
const { Button, Input, message, notification } = require('antd');

export default function LanguageView(props) {

    const [i18nWordTextArea, setI18nWordTextArea] = useState('')
    const [api, contextHolder] = notification.useNotification();

    const openNotification = (placement, des) => {
        api.info({
            message: `提示`,
            description: des,
            placement,
        });
    };

    useEffect(() => {
        console.log(JSON.stringify(props))
    }, [])

    return (
        <div style={{ paddingLeft: 30, paddingRight: 30, paddingTop: 18, display: 'flex', flexDirection: 'column' }}>
            {contextHolder}
            <Input.TextArea onChange={(e) => {
                // this.state.i18nWordTextArea = e.target.value
                // this.setState({ i18nWordTextArea: e.target.value })
                setI18nWordTextArea(e.target.value)
            }} rows={18} value={i18nWordTextArea} />
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'row' }}>
                <Button style={{ width: 100 }} onClick={() => {
                    try {
                        if (i18nWordTextArea) {
                            let objStr = i18nWordTextArea.replace(/(?:\s*['"]*)?([a-zA-Z0-9]+)(?:['"]*\s*)?:/g, "'$1':").replace('\n', '')
                            if (!objStr.startsWith('{')) {
                                objStr = '{' + objStr
                            }
                            if (!objStr.endsWith('}')) {
                                objStr = objStr + '}'
                            }
                            let obj = eval(`(${objStr})`)
                            // let obj = (new Function("return " + objStr))()
                            let excel = ''
                            for (let k of Object.keys(obj)) {
                                if (typeof obj[k] == 'object') {
                                    obj[k] = obj[k]['zh'] + '\t' + obj[k]['en']
                                }
                                excel += k + '\t' + obj[k] + '\r'
                            }
                            setI18nWordTextArea(excel)
                        } else {
                            openNotification('bottomRight', '请输入要转换的内容')
                        }
                    } catch (error) {
                        console.error(error.message)
                    }
                }}>转换Excel</Button>
                <Button style={{ width: 100, marginLeft: 10 }} onClick={() => {
                    if (i18nWordTextArea) {
                        let objStr = '{\n'
                        let objArray = []
                        const languages = ['zh', 'en', 'fr']
                        if (i18nWordTextArea.includes('\r')) {
                            objArray = i18nWordTextArea.split('\r')
                        } else {
                            objArray = i18nWordTextArea.split('\n')
                        }
                        for (let objItem of objArray) {
                            if (objItem) {
                                let kvs = objItem.split('\t')
                                if (kvs.length > 2 && kvs[2][0]) {
                                    objStr += `${kvs[0]}: "${kvs[2].replace(kvs[2][0], kvs[2][0].toLocaleUpperCase())}",\n`
                                } else {
                                    let value = objItem.substring(objItem.indexOf('\t') + 1)
                                    //首字母转大写
                                    if (value && value[0]) {
                                        let newValue = value.replace(value[0], value[0].toLocaleUpperCase())
                                        objItem = objItem.replace(value, newValue)
                                        objStr += objItem.replace('\t', ': "') + '",\n'
                                    }
                                }
                            }
                        }
                        objStr += '}'
                        // this.setState({ i18nWordTextArea: objStr })
                        setI18nWordTextArea(objStr)
                    } else {
                        openNotification('bottomRight', '请输入要转换的表格')
                    }
                }}>转换Object</Button>
                <Button style={{ width: 140, marginLeft: 10 }} onClick={() => {
                    if (i18nWordTextArea) {
                        let objStr = '{\n'
                        let objArray = []
                        const languages = ['zh', 'en', 'fr']
                        if (i18nWordTextArea.includes('\r')) {
                            objArray = i18nWordTextArea.split('\r')
                        } else {
                            objArray = i18nWordTextArea.split('\n')
                        }
                        let obj = {}
                        for (let objItem of objArray) {
                            if (objItem) {
                                let kvs = objItem.split('\t')
                                if (kvs.length > 2 && kvs[2][0]) {
                                    obj[kvs[0]] = { zh: kvs[1], en: kvs[2] }
                                    objStr = objStr + `\t${kvs[0]}: {\n\t\tzh: "${kvs[1]}",\n\t\ten: "${kvs[2].replace(kvs[2][0], kvs[2][0].toLocaleUpperCase())}"\n\t},\n`
                                } else if (kvs[1][0]) {
                                    obj[kvs[0]] = { en: kvs[1].replace(kvs[1][0], kvs[1][0].toLocaleUpperCase()) }
                                    setI18nWordTextArea(JSON.stringify(obj, null, 2))
                                    return
                                }
                            }
                        }
                        objStr += '}'
                        setI18nWordTextArea(objStr)
                        // this.setState({ i18nWordTextArea: JSON.stringify(obj, null, 2) })
                    } else {
                        openNotification('bottomRight', '请输入要转换的表格')
                    }
                }}>转换单文件Object</Button>
                <Button style={{ width: 100, marginLeft: 10 }} onClick={() => {
                    if (i18nWordTextArea) {
                        let copyPath = props.projDir + '\\copy.txt'
                        fs.writeFileSync(copyPath, i18nWordTextArea, 'utf8')
                        let cmdStr = 'CHCP 65001 && clip < ' + copyPath
                        let packageProcess = exec(cmdStr, { cwd: props.projDir, encoding: 'buffer' }, (error, stdout, stderr) => {
                            if (error) {
                                message.error('复制出错！')
                                console.error(`执行出错: ${iconv.decode(error.message, 'cp936')}`);
                                // return;
                            } else {
                                message.info('复制完成！')
                            }
                            console.log(`stdout: ${iconv.decode(stdout, 'CP936')}`);
                            console.log(`stderr: ${iconv.decode(stderr, 'CP936')}`);
                        });
                        packageProcess.stdout.on('data', (data) => {
                            console.log(`stdout: ${data}`);
                        });
                    } else {
                        openNotification('bottomRight', '没有要复制的内容')
                    }
                }}>复制</Button>
                <Button style={{ width: 120, marginLeft: 10 }} onClick={async () => {
                    const { shell } = require('electron')
                    await shell.openExternal('https://ztn.feishu.cn/sheets/shtcn5JOofNJl69VOKMMKXhpTQb')
                }}>跳转在线文档</Button>
            </div>
        </div>
    )
}