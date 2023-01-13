/*
 * @Author: 袁康乐 yuankangle@yunexpress.cn
 * @Date: 2022-10-27 09:55:52
 * @LastEditors: 康乐 yuankangle@yunexpress.cn
 * @LastEditTime: 2023-01-12 16:05:08
 * @FilePath: \RN-MultiBundler-UI\src\page\ApiView.js
 * @Description: Api调试
 */
import { useState, useEffect, useRef } from 'react';
const { Button, Input, notification } = require('antd');
import * as RequestHttp from '../net/RequestHttp'
const { remote } = require("electron");
import { workSpace } from '../config'

export default function ApiView() {
    const stateRef = useRef({ url: '', params: '' })
    const [responseResult, setResponseResult] = useState('')
    const [progress, setProgress] = useState('')
    const [api, contextHolder] = notification.useNotification();

    const openNotification = (placement, des) => {
        api.info({
            message: `提示`,
            description: des,
            placement,
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 30, paddingRight: 30 }}>
            {contextHolder}
            <Input placeholder={'请输入接口地址'} onChange={(e) => {
                stateRef.current.url = e.target.value
            }} />
            <Input.TextArea rows={6} style={{ marginTop: 10 }} placeholder={'请输入请求参数'} onChange={(e) => {
                stateRef.current.params = e.target.value
            }} />
            <div style={{ marginTop: 15 }}>
                <Button style={{ width: 100 }} onClick={() => {
                    if (!stateRef.current.url) {
                        openNotification('bottomRight', '请输入接口地址')
                    }
                    setResponseResult('')
                    RequestHttp.post(stateRef.current.url, stateRef.current.params ? JSON.parse(stateRef.current.params) : null).then((res) => {
                        setResponseResult(JSON.stringify(res, null, 2))
                    })
                }}>POST</Button>
                <Button style={{ width: 100, marginLeft: 20 }} onClick={() => {
                    if (!stateRef.current.url) {
                        openNotification('bottomRight', '请输入接口地址')
                    }
                    setResponseResult('')
                    RequestHttp.get(stateRef.current.url).then((res) => {
                        setResponseResult(JSON.stringify(res, null, 2))
                    })
                }}>GET</Button>
                <Button style={{ width: 100, marginLeft: 20 }} onClick={() => {
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
                                let url = RequestHttp.getUploadUrl(fileName)
                                RequestHttp.uploadFile(url, fileName, file, (progress) => {
                                    setProgress((progress * 100).toFixed(0) + '%')
                                    if (progress == 1) {
                                        openNotification('bottomRight', '上传完成')
                                        // let to = setTimeout(() => {
                                        //     clearTimeout(to)
                                        // }, 0)
                                    }
                                }).then((res) => {
                                    setResponseResult(JSON.stringify(res, null, 2))
                                }).catch((err) => {
                                    setResponseResult(JSON.stringify(err, null, 2))
                                    openNotification('bottomRight', '文件已存在')
                                })
                            } else {
                                openNotification('bottomRight', '取消选择文件')
                            }
                        }
                    )
                }}>{progress || 'Upload'}</Button>
            </div>
            <Input.TextArea rows={20} style={{ marginTop: 10 }} value={responseResult} />
        </div>
    )
}