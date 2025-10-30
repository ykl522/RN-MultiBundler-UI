/*
 * @Author: 康乐 yuankangle@gmail.com
 * @Date: 2023-09-04 15:15:47
 * @LastEditors: 康乐 yuankangle@gmail.com
 * @LastEditTime: 2024-06-07 10:39:44
 * @FilePath: \RN-MultiBundler-UI\src\page\InterfaceView.js
 * @Description: 接口
 */

import { Button, Input, notification } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import WinExec from '../utils/WinExec';
import { post } from '../net/HttpRequest';


export default function InterfaceView(props) {
    const [api, contextHolder] = notification.useNotification();
    const openNotification = (des, placement = 'bottomRight') => {
        api.info({
            message: `提示`,
            description: des,
            placement,
        });
    };
    const [inputTextArea, setInputTextArea] = useState('')
    const [outputTextArea, setOutputTextArea] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        console.log('===============deepSeekKey.current===', props.deepSeekKey)
    }, [])
    const deepSeek = (text) => {
        if (!props.deepSeekKey) {
            openNotification('请在【文件】--【设置】中配置deepSeekKey')
            return
        } else {
            openNotification('正在回答...')
            console.log('props.deepSeekKey===>', props.deepSeekKey)
        }
        setLoading(true)
        post('https://api.deepseek.com/chat/completions', {
            "model": "deepseek-reasoner", // 模型名称 deepseek-chat / deepseek-reasoner 深度思考价格翻倍
            "messages": [
                { "role": "system", "content": '你是一个推理大师' },
                { "role": "user", "content": text }
            ],
            "stream": false
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${props.deepSeekKey}`
            }
        }).then((res) => {
            console.log('res===>', res)
            if (res.choices) {
                openNotification("成功回答")
                setOutputTextArea(res.choices[0].message.content)
            }
        }).finally(() => {
            setLoading(false)
        })
    }

    /**
     * 获取注释
     * @param {string[]} lines 
     * @param {string[]} nextLines 
     */
    const getExplanatoryNoteTitle = (lines, apiName) => {
        /** @type {string} */
        let title = ''
        if (!apiName) return ''
        for (const index in lines) {
            const line = lines[index]
            // console.log('line===>', line)
            if (line && ((line.includes('//') && !line.includes('/*')) || (!line.includes('/*') && line.includes('* ')))) {
                if (line.includes('//')) {
                    title = line.replace('//', '').trim()
                } else {
                    return line.replace('//', '').replace('* ', '').trim() + '\t' + apiName + '\n'
                }
            }
        }
        return title + '\t' + apiName + '\n'
    }

    /**
     * 获取api方法
     * @param {string} line 
     * @param {string} include 
     */
    const getMothed = (line, include) => {
        const first = line.substring(line.indexOf('=>'))
        const second = first.substring(first.indexOf(include) + 1)
        const result = second.substring(0, second.indexOf(include))
        if (result.includes('?')) {
            return result.substring(0, result.indexOf('?'))
        }
        return result
    }

    /**
     * 获取API名称
     * @param {string[]} lines 
     */
    const getAPiName = (lines) => {
        for (const index in lines) {
            const line = lines[index]
            if (line && (line.includes('httpPostOPA')
                || line.includes('httpPostOps')
                || line.includes('httpFetchOPA')
                || line.includes('httpGetOps')
                || line.includes('export const')
            )) {
                if (line.includes("`")) {
                    return getMothed(line, "`")
                }
                if (line.includes("'")) {
                    return getMothed(line, "'")
                }
                if (line.includes(`"`)) {
                    return getMothed(line, `"`)
                }
            }
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 30, paddingRight: 30 }}>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <Input.TextArea placeholder={'请输入你要问的内容'} onChange={(e) => {
                    setInputTextArea(e.target.value)
                }} rows={4} value={inputTextArea} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <Button
                    loading={loading}
                    style={{ width: 100, marginTop: 15, marginBottom: 15, marginRight: 15 }}
                    onClick={() => {
                        if (inputTextArea) {
                            setOutputTextArea('')
                            deepSeek(inputTextArea)
                        } else {
                            openNotification('请输入你要问的内容')
                        }
                    }}
                >回答</Button>
                <Button
                    style={{ width: 100, marginTop: 15, marginBottom: 15, marginRight: 15 }}
                    onClick={() => {
                        setInputTextArea('')
                        setOutputTextArea('')
                    }}
                >清空</Button>
            </div>
            <Input.TextArea placeholder={'此处输出DeepSeek回答的答案'} onChange={(e) => {
                setInputTextArea(e.target.value)
            }} rows={30} value={outputTextArea} />
            {contextHolder}
        </div>
    )

}