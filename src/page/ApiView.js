/*
 * @Author: 康乐 yuankangle@gmail.com
 * @Date: 2022-10-27 09:55:52
 * @LastEditors: 康乐 yuankangle@gmail.com
 * @LastEditTime: 2023-02-27 16:55:43
 * @FilePath: \RN-MultiBundler-UI\src\page\ApiView.js
 * @Description: Api调试
 */
import { useState, useEffect, useRef } from 'react';
const { Button, Input, notification } = require('antd');
import { post, get, uploadFile, getUploadUrl } from '../net/HttpRequest';
const { remote } = require("electron");
import { workSpace } from '../config'

export default function ApiView(props) {
    const stateRef = useRef({ url: '', params: '', headers: '' })
    const [responseResult, setResponseResult] = useState('')
    const [progress, setProgress] = useState('')
    const [api, contextHolder] = notification.useNotification();
    const requestTime = useRef(0)
    const [loadingTime, setLoadingTime] = useState('')

    const openNotification = (placement, des) => {
        if (api) {
            api.info({
                message: `提示`,
                description: des,
                placement,
            });
        }
    };

    const uploadFileReq = (url, fileName, file) => {
        if (!file) {
            openNotification('bottomRight', '请选择文件')
            return
        }
        requestTime.current = new Date().getTime()
        setLoadingTime(0)
        uploadFile(url, fileName, file, (progress) => {
            setProgress((progress * 100).toFixed(0) + '%')
            if (progress == 1) {
                console.log('上传完成---------' + progress)
                setLoadingTime(new Date().getTime() - requestTime.current)
                openNotification('bottomRight', '上传完成')
            }
        }, stateRef.current.headers ? { headers: stateRef.current.headers } : null).then((res) => {
            setResponseResult(JSON.stringify(res, null, 2))
        }).catch((err) => {
            setResponseResult(JSON.stringify(err, null, 2))
            openNotification('bottomRight', JSON.stringify(err, null, 2))
        })
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 30, paddingRight: 30 }}>
            {contextHolder}
            <Input placeholder={'请输入接口地址'} onChange={(e) => {
                stateRef.current.url = e.target.value
            }} />
            <Input.TextArea rows={5} style={{ marginTop: 10 }} placeholder={'请输入请求Headers'} onChange={(e) => {
                if (e.target.value) {
                    var obj = {};
                    e.target.value.split('\n').forEach(function(line) {
                        if (line.trim() === "") return;
                        var parts = line.split(':');
                        var key = parts[0].trim();
                        var value = parts[1].trim();
                        obj[key] = value;
                    });
                    console.log("obj------------>" + JSON.stringify(obj))
                    stateRef.current.headers = obj
                }
            }} />
            <Input.TextArea rows={6} style={{ marginTop: 10 }} placeholder={'请输入请求参数'} onChange={(e) => {
                stateRef.current.params = e.target.value
            }} />
            <div style={{ marginTop: 15 }}>
                <Button style={{ width: 100 }} loading={loadingTime === 0} onClick={() => {
                    if (!stateRef.current.url) {
                        openNotification('bottomRight', '请输入接口地址')
                        return
                    }
                    setResponseResult('')
                    setLoadingTime(0)
                    requestTime.current = new Date().getTime()
                    post(stateRef.current.url, stateRef.current.params ? JSON.parse(stateRef.current.params) : null, 
                        stateRef.current.headers ? { headers: stateRef.current.headers } : null).then((res) => {
                        setLoadingTime(new Date().getTime() - requestTime.current)
                        setResponseResult(JSON.stringify(res, null, 2))
                    }).catch((err) => {
                        if (err && err.message) {
                            openNotification('bottomRight', err.message)
                        }
                    })
                }}>POST</Button>
                <Button style={{ width: 100, marginLeft: 20 }} loading={loadingTime === 0} onClick={() => {
                    if (!stateRef.current.url) {
                        openNotification('bottomRight', '请输入接口地址')
                        return
                    }
                    setResponseResult('')
                    setLoadingTime(0)
                    requestTime.current = new Date().getTime()
                    get(stateRef.current.url, stateRef.current.headers ? { headers: stateRef.current.headers } : null).then((res) => {
                        setLoadingTime(new Date().getTime() - requestTime.current)
                        setResponseResult(JSON.stringify(res, null, 2))
                    }).catch((err) => {
                        if (err && err.message) {
                            openNotification('bottomRight', err.message)
                        }
                    })
                }}>GET</Button>
                <Button style={{ width: 100, marginLeft: 20 }} loading={loadingTime === 0} onClick={() => {
                    setResponseResult('')
                    setProgress('')
                    remote.dialog.showOpenDialog(
                        remote.getCurrentWindow(),
                        {
                            defaultPath: workSpace + '\\android\\app\\build\\outputs\\apk\\YT\\release',
                            title: '上传文件',
                            buttonLabel: '选择',
                            filters: undefined,
                            properties: ['openFile']
                        },
                        (filePath) => {
                            if (filePath) {
                                const file = filePath[0] + '';
                                let fileName = file.substring(file.lastIndexOf('\\') + 1)
                                let url = props.uploadUrl || stateRef.current.url
                                uploadFileReq(url, fileName, file)
                            } else {
                                openNotification('bottomRight', '取消选择文件')
                            }
                        }
                    )
                }}>{progress || 'Upload'}</Button>
            </div>
            <div style={{ marginTop: 10 }}>请求总耗时(毫秒)：{loadingTime || ''}</div>
            <Input.TextArea rows={20} style={{ marginTop: 10 }} value={responseResult} />
        </div>
    )
}