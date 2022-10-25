import { useState, useEffect } from 'react';
const { exec } = require('child_process');
const fs = require("fs");
const { Button, Input, message } = require('antd');

export default function LanguageView(props) {

    const [i18nWordTextArea, setI18nWordTextArea] = useState('')

    useEffect(() => {
        console.log(JSON.stringify(props))
    }, [])

    return (
        <div style={{ paddingLeft: 30, paddingRight: 30, paddingTop: 18, display: 'flex', flexDirection: 'column' }}>
            <Input.TextArea onChange={(e) => {
                // this.state.i18nWordTextArea = e.target.value
                // this.setState({ i18nWordTextArea: e.target.value })
                setI18nWordTextArea(e.target.value)
            }} rows={15} value={i18nWordTextArea} />
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'row' }}>
                <Button style={{ width: 100 }} onClick={() => {
                    if (i18nWordTextArea) {
                        let objStr = i18nWordTextArea.replace(/(?:\s*['"]*)?([a-zA-Z0-9]+)(?:['"]*\s*)?:/g, "'$1':").replace('\n', '')
                        if (!objStr.startsWith('{')) {
                            objStr = '{' + objStr
                        }
                        if (!objStr.endsWith('}')) {
                            objStr = objStr + '}'
                        }
                        let obj = eval(`(${objStr})`)
                        let excel = ''
                        for (let k of Object.keys(obj)) {
                            if (typeof obj[k] == 'object') {
                                obj[k] = obj[k]['en']
                            }
                            excel += k + '\t' + obj[k] + '\r'
                        }
                        setI18nWordTextArea(excel)
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
                                if (kvs.length > 2) {
                                    objStr += `${kvs[0]}: '${kvs[2]}',\n`
                                } else {
                                    objStr += objItem.replace('\t', ": '") + "',\n"
                                }
                            }
                        }
                        objStr += '}'
                        // this.setState({ i18nWordTextArea: objStr })
                        setI18nWordTextArea(objStr)
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
                                if (kvs.length > 2) {
                                    obj[kvs[0]] = { zh: kvs[1], en: kvs[2] }
                                    objStr = objStr + `\t${kvs[0]}: {\n\t\tzh: '${kvs[1]}',\n\t\ten: '${kvs[2]}'\n\t},\n`
                                } else {
                                    obj[kvs[0]] = { en: kvs[1] }
                                    setI18nWordTextArea(JSON.stringify(obj, null, 2))
                                    return
                                }
                            }
                        }
                        objStr += '}'
                        setI18nWordTextArea(objStr)
                        // this.setState({ i18nWordTextArea: JSON.stringify(obj, null, 2) })
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
                    }
                }}>复制</Button>
            </div>
        </div>
    )
}