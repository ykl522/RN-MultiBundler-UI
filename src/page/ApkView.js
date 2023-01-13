/*
 * @Author: 康乐 yuankangle@yunexpress.cn
 * @Date: 2023-01-10 16:34:41
 * @LastEditors: 康乐 yuankangle@yunexpress.cn
 * @LastEditTime: 2023-01-13 15:11:17
 * @FilePath: \RN-MultiBundler-UI\src\page\ApkView.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { useState, useEffect, useRef } from 'react';
import { InboxOutlined } from '@ant-design/icons';
const { Button, Input, notification, Upload } = require('antd');
const { remote } = require("electron");
const { exec } = require('child_process');
const path = require('path');
const toolPath = path.dirname(__dirname).substring(0, __dirname.lastIndexOf(path.sep)) + path.sep + 'tools' + path.sep

export default function ApkView() {

    const [api, contextHolder] = notification.useNotification();
    const [loading, setLoading] = useState(false)
    const [fileList, setFileList] = useState([])
    let fileListRef = useRef([])

    const openNotification = (placement, des) => {
        api.info({
            message: `提示`,
            description: des,
            placement,
        });
    };

    const props = {
        name: 'file',
        multiple: true,
        showUploadList: fileList.length > 0,
        beforeUpload: (file) => {
            console.log('file.type: ', file.type)
            const isApk = file.type === 'application/vnd.android.package-archive'
            if (!isApk) {
                openNotification('bottomRight', '文件格式不对，必须是APK安装包')
            }
            return isApk
        },
        onChange: (info) => {
            const { status, originFileObj } = info.file;
            console.log(status + "===>", info.fileList)
            if (status === 'done') {
                for (let file of info.fileList) {
                    file.url = ''
                    file.path = originFileObj.path
                }
                fileListRef.current = [[...info.fileList][info.fileList.length - 1]]
                setFileList(fileListRef.current)
            } else if (status) {
                console.log(status + "--->", info.fileList)
                //必须刷新，不然状态不会改变
                setFileList([...info.fileList])
            }
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
        onPreview(e) {
            console.log('------------', e)
        },
        onRemove(e) {
            fileListRef.current = []
            for (let item of fileList) {
                if (e.uid != item.uid) {
                    fileListRef.current.push(item)
                }
            }
            setFileList([...fileListRef.current])
        }
    };

    let deleteDir = (nowPath) => {
        const fs = require("fs");
        if (fs.existsSync(nowPath)) {
            // 读取目录中的所有文件及文件夹（同步操作）
            let files = fs.readdirSync(nowPath)
            //遍历检测目录中的文件
            console.log('----------delete-----------')
            files.forEach((fileName, index) => {
                // 打印当前读取的文件名
                // 当前文件的全路径
                let fillPath = path.join(nowPath, fileName)
                // 获取一个文件的属性
                let file = fs.statSync(fillPath)
                // 如果是目录的话，继续查询
                if (file.isDirectory()) {
                    // （递归）重新检索目录文件
                    deleteDir(fillPath)
                    fs.rmdirSync(fillPath)
                    console.log(fileName)
                } else {
                    // 删除文件
                    fs.unlinkSync(fillPath)
                    console.log(index + "---" + fileName)
                }
            })
        }
        console.log('+---------delete----------+')
    }

    // let asyncDel = (path) => {
    //     return new Promise((resolve, reject) => {
    //         deleteDir(path)
    //         console.log("**********************************删除完成**************************************")
    //         resolve()
    //     })
    // }

    let fileIsExist = () => {
        if (fileListRef.current && fileListRef.current.length > 0 && fileListRef.current[0]) {
            return true
        } else {
            openNotification('bottomRight', '目录不存在，请先拖入APK再解析！')
        }
        return false
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 30, paddingRight: 30 }}>
            {contextHolder}
            <Upload.Dragger height={250} {...props} fileList={fileList}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">单击或拖动文件到此区域</p>
                <p className="ant-upload-hint">
                    支持单个APK文件进行解析
                </p>
            </Upload.Dragger>
            <div style={{ display: 'flex', flexDirection: 'row', marginTop: 15 }}>
                <Button style={{ width: 120 }} loading={loading} onClick={() => {
                    if (fileIsExist()) {
                        setLoading(true)
                        let filePath = fileListRef.current[0].path
                        let apktoolPath = toolPath + 'apktool_2.7.0.jar'
                        console.log('curDir', apktoolPath);
                        console.log('path.dirname', path.dirname(filePath));
                        let cmdStr = `java -jar ${apktoolPath} d -f ${filePath} -o ${path.dirname(filePath) + path.sep + path.basename(fileListRef.current[0].path, '.apk')}`
                        console.log('cmdStr', cmdStr);
                        let packageProcess = exec(cmdStr, { cwd: path.dirname(filePath), encoding: 'buffer' }, (error, stdout, stderr) => {
                            const iconv = require('iconv-lite')
                            if (error) {
                                openNotification('bottomRight', '解析APK执行出错')
                                console.error(`执行出错: ${iconv.decode(error.message, 'cp936')}`);
                                // return;
                            } else {
                                openNotification('bottomRight', '解析APK完成！')
                            }
                            console.log(`stdout: ${iconv.decode(stdout, 'CP936')}`);
                            console.log(`stderr: ${iconv.decode(stderr, 'CP936')}`);
                            setLoading(false)
                        });
                        let cmdRetStrs = cmdStr
                        packageProcess.stdout.on('data', (data) => {
                            console.log(`stdout: ${data}`);
                            cmdRetStrs += data;
                            // setCmdStr(cmdRetStrs)
                            // console.log(logTextRef.current.resizableTextArea.textArea.scrollHeight)
                        });
                        openNotification('bottomRight', '正在解析APK文件...')
                    }
                }}>解析APK</Button>
                <Button style={{ width: 120, marginLeft: 15 }} onClick={() => {
                    if (fileIsExist()) {
                        remote.shell.openItem(`${path.dirname(fileListRef.current[0].path) + path.sep + path.basename(fileListRef.current[0].path, '.apk')}`)
                    }
                }}>跳转解析目录</Button>
                <Button style={{ width: 140, marginLeft: 15 }} loading={loading} onClick={() => {
                    if (fileIsExist()) {
                        setLoading(true)
                        let t = setTimeout(() => {
                            deleteDir(`${path.dirname(fileListRef.current[0].path) + path.sep + path.basename(fileListRef.current[0].path, '.apk')}`)
                            setLoading(false)
                            clearTimeout(t)
                            openNotification('bottomRight', '清空解析目录完成！')
                        }, 200)
                    }
                }}>清空解析目录</Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginTop: 15, marginBottom: 15 }}>
                <Button style={{ width: 120 }} loading={loading} onClick={() => {
                    if (fileIsExist()) {
                        setLoading(true)
                        let filePath = fileListRef.current[0].path
                        let apktoolPath = toolPath + 'apktool_2.7.0.jar'
                        let cmdStr = `java -jar ${apktoolPath} empty-framework-dir & java -jar ${apktoolPath} b -f ${path.dirname(filePath) + path.sep + path.basename(filePath, '.apk')} -o New_${path.basename(filePath)}`
                        let packageProcess = exec(cmdStr, { cwd: path.dirname(filePath), encoding: 'buffer' }, (error, stdout, stderr) => {
                            const iconv = require('iconv-lite')
                            if (error) {
                                openNotification('bottomRight', '二次打包执行出错')
                                console.error(`执行出错: ${iconv.decode(error.message, 'cp936')}`);
                                // return;
                            } else {
                                openNotification('bottomRight', '二次打包APK完成！')
                            }
                            console.log(`stdout: ${iconv.decode(stdout, 'CP936')}`);
                            console.log(`stderr: ${iconv.decode(stderr, 'CP936')}`);
                            setLoading(false)
                        });
                        let cmdRetStrs = cmdStr
                        packageProcess.stdout.on('data', (data) => {
                            console.log(`stdout: ${data}`);
                            cmdRetStrs += data;
                            // setCmdStr(cmdRetStrs)
                            // console.log(logTextRef.current.resizableTextArea.textArea.scrollHeight)
                        });
                        openNotification('bottomRight', '正在二次打包APK文件...')
                    }
                }}>二次打包</Button>
                <Button style={{ width: 120, marginLeft: 15 }} loading={loading} onClick={() => {
                    if (fileIsExist()) {
                        setLoading(true)
                        let filePath = fileListRef.current[0].path
                        let signJks = toolPath + 'androidSign.jks'
                        let unsignApk = path.dirname(filePath) + path.sep + 'New_' + path.basename(filePath)
                        let apktoolPath = toolPath + 'apksigner.jar'
                        let cmdStr = `java -jar ${apktoolPath} sign --ks ${signJks} ${unsignApk}`
                        console.log('cmdStr-->', cmdStr)
                        let packageProcess = exec(cmdStr, { cwd: path.dirname(path.dirname(filePath)), encoding: 'buffer' }, (error, stdout, stderr) => {
                            const iconv = require('iconv-lite')
                            if (error) {
                                openNotification('bottomRight', '签名执行出错')
                                console.error(`执行出错: ${iconv.decode(error.message, 'cp936')}`);
                                // return;
                            } else {
                                openNotification('bottomRight', '签名APK完成！')
                            }
                            console.log(`stdout: ${iconv.decode(stdout, 'CP936')}`);
                            console.log(`stderr: ${iconv.decode(stderr, 'CP936')}`);
                            setLoading(false)
                        });
                        let cmdRetStrs = cmdStr
                        packageProcess.stdout.on('data', (data) => {
                            console.log(`stdout: ${data}`);
                            cmdRetStrs += data;
                            // setCmdStr(cmdRetStrs)
                            // console.log(logTextRef.current.resizableTextArea.textArea.scrollHeight)
                        });
                        packageProcess.stdin.write('shenzhenshiyuntu')
                        packageProcess.stdin.end()
                    }
                }}>APK签名</Button>
                <Button style={{ width: 140, marginLeft: 15 }} onClick={() => {
                    if (fileIsExist()) {
                        remote.shell.openItem(`${path.dirname(fileListRef.current[0].path)}`)
                    }
                }}>跳转新APP目录</Button>
            </div>
        </div>
    )
}