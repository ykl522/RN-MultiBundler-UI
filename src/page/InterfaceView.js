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

export default function InterfaceView() {
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
        let first = ''
        if (line.includes('=>')) {
            first = line.substring(line.indexOf('=>'))
        } else {
            first = line.substring(line.indexOf(include))
        }
        const second = first.substring(first.indexOf(include) + 2)
        const result = second.substring(0, second.indexOf(include[1]))
        console.log('result===>', result)
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
            if (line && (line.includes('(`/')
                || line.includes(`('/`)
                || line.includes(`("/`)
                || line.includes(`>("`)
                || line.includes(`>('`)
                || line.includes('>(`')
            )) {
                if (line.includes("(`")) {
                    return getMothed(line, "(`")
                }
                if (line.includes("('")) {
                    return getMothed(line, "('")
                }
                if (line.includes(`("`)) {
                    return getMothed(line, `("`)
                }
            }
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 30, paddingRight: 30 }}>
            <div style={{ display: 'flex', flexDirection: 'row' }}>

                <Input.TextArea placeholder={'请粘贴要转换的代码'} onChange={(e) => {
                    setInputTextArea(e.target.value)
                }} rows={20} value={inputTextArea} />
                <Input.TextArea placeholder={'此处输出转换的内容'} onChange={(e) => {
                    setInputTextArea(e.target.value)
                }} rows={20} value={outputTextArea} />
            </div>
            <Button
                style={{ width: 160, marginTop: 15, marginBottom: 15, marginRight: 15 }}
                onClick={() => {
                    setOutputTextArea('')
                    if (inputTextArea) {
                        let apis = []
                        if (inputTextArea.includes('api.')) {
                            apis = `${inputTextArea}`.split('api.')
                        } else if (inputTextArea.includes('export ')) {
                            apis = `${inputTextArea}`.split('export ')
                        } else if (inputTextArea.includes('return ')) {
                            apis = `${inputTextArea}`.split('return ')
                        }
                        console.log('apis个数===>', apis.length - 1)
                        let excelStr = ''
                        for (const index in apis) {
                            const api = apis[index]
                            const lines = api.split('\n')
                            if (Number(index) + 1 < apis.length) {
                                const nextLines = apis[Number(index) + 1].split('\n')
                                const apiName = getAPiName(nextLines)
                                if (excelStr.includes(apiName)) continue
                                excelStr += getExplanatoryNoteTitle(lines, apiName)
                            }
                        }
                        if (excelStr) {
                            console.log(excelStr)
                            // let cmdStr = `CHCP 65001 && (echo|set/p=${excelStr})|clip`
                            // WinExec.cmd(cmdStr)
                            openNotification("提取成功")
                            setOutputTextArea(excelStr)
                        } else {
                            openNotification("提取失败")
                        }
                    }
                }}
            >代码中接口名提取</Button>
            {contextHolder}
        </div>
    )

}