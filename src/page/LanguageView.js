import { useState, useEffect } from 'react';
const { exec } = require('child_process');
const fs = require("fs");
const { Button, Input, message, notification } = require('antd');

export default function LanguageView(props) {

    const [outputTextArea, setOutputTextArea] = useState('')
    const [inputTextArea, setInputTextArea] = useState('')
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

    const obj2Excel = (text) => {
        let objStrings = text.split('\n')
        let excelString = ''
        let parent = ''
        for (let item of objStrings) {
            item = (item + "").trim()
            //去掉有注释//的情况 
            if (item == '' || item.startsWith('\\/\\/')) {
                continue;
            }
            if (item && item.indexOf(':') > -1) {
                let key = item.substring(0, item.indexOf(':'))
                let value = item.substring(item.indexOf(':') + 1).trim()
                if (value.startsWith('{')) {
                    parent = key.replace(/['"`]/g, '')
                    console.log(parent)
                    continue
                }
                if (key.startsWith(`'`) || key.startsWith(`"`) || key.startsWith('`')) {
                    key = key.substring(1, key.length - 1)
                }
                if (parent) {
                    key = parent + '.' + key
                }
                // value 后面有注释//的情况
                if (value.indexOf('//') > -1) {
                    console.log('==========' + value)
                    value = value.split(',')[0]
                }
                if (value.startsWith(`'`) || value.startsWith(`"`) || value.startsWith('`')) {
                    value = value.substring(1, value.endsWith(',') ? value.length - 2 : value.length - 1)
                }
                excelString += key + '\t' + value + '\n'
            } else if (item && item.indexOf('}') > -1) {
                parent = ''
            }
        }
        return excelString
    }

    const excel2Obj = (outputTextArea) => {
        let objArray = []
        if (outputTextArea) {
            if (outputTextArea.includes('\r')) {
                objArray = outputTextArea.split('\r')
            } else {
                objArray = outputTextArea.split('\n')
            }
        }
        let obj = {}
        for (let objItem of objArray) {
            if (objItem && objItem.indexOf('\t') != -1) {
                let kvs = objItem.split('\t')
                let value = ''
                if (kvs.length > 2 && kvs[kvs.length][0]) {
                    value = `${kvs[kvs.length].replace(kvs[kvs.length][0], kvs[kvs.length][0].toLocaleUpperCase())}`
                } else if (kvs[1][0]) {
                    value = `${kvs[1].replace(kvs[1][0], kvs[1][0].toLocaleUpperCase())}`
                }
                if (kvs[0].indexOf('.') > 0) {
                    let pks = kvs[0].split('.')
                    if (!obj[pks[0]]) obj[pks[0]] = {}
                    obj[pks[0]][pks[1]] = value
                } else {
                    obj[kvs[0]] = value
                }
            }
        }
        return obj
    }

    const isExcel = (text) => {
        if (text) {
            if (!text.startsWith('{') && !text.startsWith('"') && !text.startsWith("'") && text.indexOf('\t') != -1) {
                return true
            }
        }
        return false
    }

    const asyncObj = (zhObj, otherObj) => {
        if (zhObj && otherObj) {
            for (let key of Object.keys(zhObj)) {
                if (!otherObj[key]) {
                    otherObj[key] = zhObj[key]
                } else {
                    if ((typeof zhObj[key] == 'object') && (typeof otherObj[key] == 'object')) {
                        otherObj[key] = asyncObj(zhObj[key], otherObj[key])
                    }
                }
            }
        }
        return otherObj
    }

    return (
        <div style={{ paddingLeft: 30, paddingRight: 30, paddingTop: 18, display: 'flex', flexDirection: 'column' }}>
            {contextHolder}
            <Input.TextArea onChange={(e) => {
                setInputTextArea(e.target.value)
            }} rows={10} value={inputTextArea} />
            <div style={{ marginTop: 10, marginBottom: 10, display: 'flex', flexDirection: 'row' }}>
                <Button style={{ width: 120 }} onClick={() => {
                    try {
                        if (inputTextArea) {
                            // let objStr = outputTextArea.replace(/(?:\s*['"]*)?([a-zA-Z0-9]+)(?:['"]*\s*)?:/g, "'$1':").replace('\n', '')
                            setOutputTextArea(obj2Excel(inputTextArea))
                        } else {
                            openNotification('bottomRight', '请输入要转换的内容')
                        }
                    } catch (error) {
                        console.error(error.message)
                    }
                }}>Obj转换Excel</Button>
                <Button style={{ width: 155, marginLeft: 10 }} onClick={() => {
                    try {
                        if (inputTextArea) {
                            let excelString = ''
                            let obj = eval(`(${inputTextArea})`)
                            // let obj = JSON.parse(outputTextArea);
                            const isShowEn = true
                            for (let item of Object.keys(obj)) {
                                excelString += item.replace(/['"`]/g, '') + '\t' + obj[item]['zh'] + (isShowEn ? ('\t' + obj[item]['en']) : '') + '\n'
                            }
                            console.log(excelString)
                            setOutputTextArea(excelString)
                        } else {
                            openNotification('bottomRight', '请输入要转换的内容')
                        }
                    } catch (error) {
                        console.error(error.message)
                    }
                }}>单文件Obj转换Excel</Button>
                <Button style={{ width: 120, marginLeft: 10 }} onClick={() => {
                    if (inputTextArea) {
                        let obj = excel2Obj(inputTextArea)
                        setOutputTextArea(JSON.stringify(obj, null, 2))
                    } else {
                        openNotification('bottomRight', '请输入要转换的表格')
                    }
                }}>Excel转换Obj</Button>
                <Button style={{ width: 155, marginLeft: 10 }} onClick={() => {
                    if (inputTextArea) {
                        let objStr = '{\n'
                        let objArray = []
                        const languages = ['zh', 'en', 'fr']
                        if (inputTextArea.includes('\r')) {
                            objArray = inputTextArea.split('\r')
                        } else {
                            objArray = inputTextArea.split('\n')
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
                                }
                            }
                        }
                        if (JSON.stringify(obj) == '{}') {
                            objStr += '}'
                            setOutputTextArea(objStr)
                        } else {
                            setOutputTextArea(JSON.stringify(obj, null, 2))
                        }

                        // this.setState({ outputTextArea: JSON.stringify(obj, null, 2) })
                    } else {
                        openNotification('bottomRight', '请输入要转换的表格')
                    }
                }}>Excel转换单文件Obj</Button>
            </div>
            <div style={{ marginBottom: 10, display: 'flex', flexDirection: 'row' }}>
                <Button style={{ width: 100 }} onClick={() => {
                    if (outputTextArea && inputTextArea && inputTextArea.startsWith('{')) {
                        let zhObj = eval(`(${outputTextArea})`)
                        let otherObj = eval(`(${inputTextArea})`)
                        otherObj = asyncObj(zhObj, otherObj)
                        console.log(JSON.stringify(otherObj, null, 2))
                    } else {
                        openNotification('bottomRight', '请输入要同步的中文词条JSON对象和其它语言词条JSON对象')
                    }
                }}>同步Key</Button>
                <Button style={{ width: 155, marginLeft: 10 }} onClick={() => {
                    if (!outputTextArea) {
                        setOutputTextArea(obj2Excel(inputTextArea))
                        return
                    }
                    if (outputTextArea && inputTextArea && inputTextArea.startsWith('{')) {

                        let zhObj = {}
                        let otherObj = {}
                        let excelString = ''
                        if (isExcel(outputTextArea)) {
                            zhObj = excel2Obj(outputTextArea)
                            excelString = outputTextArea
                        } else {
                            zhObj = eval(`(${outputTextArea})`)
                            excelString = obj2Excel(outputTextArea)
                        }
                        if (isExcel(inputTextArea)) {
                            otherObj = excel2Obj(inputTextArea)
                        } else {
                            try {
                                otherObj = eval(`(${inputTextArea})`)
                            } catch (error) {
                                otherObj = excel2Obj(obj2Excel(inputTextArea))
                            }
                        }
                        let objArray = []
                        if (excelString.includes('\r')) {
                            objArray = excelString.split('\r')
                        } else {
                            objArray = excelString.split('\n')
                        }
                        let newExcel = ''
                        for (let item of objArray) {
                            if (item && item.includes('\t')) {
                                let key = item.split('\t')[0]
                                let parentKey = ''
                                if (key.indexOf('.') != -1) {
                                    parentKey = key.substring(0, key.indexOf('.'))
                                    key = key.substring(key.indexOf('.') + 1).trim()
                                }
                                let value = otherObj[key] ? otherObj[key] : zhObj[key]
                                if (parentKey) {
                                    let otherParentObj = otherObj[parentKey] || {}
                                    let zhParentObj = zhObj[parentKey] || {}
                                    value = otherParentObj[key] ? otherParentObj[key] : zhParentObj[key]
                                }
                                newExcel += item + '\t' + value + '\n'
                            }
                        }
                        console.log(newExcel)
                        setOutputTextArea(newExcel)
                    } else {
                        openNotification('bottomRight', '请输入要已合成的词条和要加入合成的词条')
                    }
                }}>多种词条合成Excel</Button>
                <Button style={{ width: 70, marginLeft: 10 }} onClick={() => {
                    if (outputTextArea) {
                        let copyPath = props.projDir + '\\copy.txt'
                        fs.writeFileSync(copyPath, outputTextArea, 'utf8')
                        let cmdStr = 'CHCP 65001 && clip < ' + copyPath
                        let packageProcess = exec(cmdStr, { cwd: props.projDir, encoding: 'buffer' }, (error, stdout, stderr) => {
                            const iconv = require('iconv-lite')
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
                <Button style={{ width: 100, marginLeft: 10 }} onClick={async () => {
                    setOutputTextArea('')
                    setInputTextArea('')
                }}>清空数据</Button>
            </div>
            <Input.TextArea onChange={(e) => {
                setOutputTextArea(e.target.value)
            }} rows={18} value={outputTextArea} />
        </div >
    )
}