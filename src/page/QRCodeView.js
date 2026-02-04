/*
 * @Author: 康乐 yuankangle@gmail.com
 * @Date: 2022-10-24 15:11:41
 * @LastEditors: 康乐 yuankangle@gmail.com
 * @LastEditTime: 2024-09-27 10:11:56
 * @FilePath: \RN-MultiBundler-UI\src\page\QRCodeView.js
 */
import QRCode from 'qrcode.react';
import Barcode from 'jsbarcode'
import React, { useState, useEffect, useRef } from 'react';
const { Button, Input, notification } = require('antd');
let jsBarcodeRefs = []

export default function QRCodeView() {

    const codeRef = useRef()
    const [api, contextHolder] = notification.useNotification();
    const [code, setCode] = useState({ value: '', type: 0 })

    const openNotification = (placement, des) => {
        api.info({
            message: `提示`,
            description: des,
            placement,
        });
    };

    const validateCode128Input = (input) => {
        // 检查是否为空或仅包含空格
        if (!input || !input.trim()) {
            openNotification('bottomRight', '请输入有效的内容。');
            return false;
        }

        // 检查是否包含非法字符（仅允许 ASCII 可打印字符）
        const validChars = /^[\x00-\x7F]+$/; // 匹配 ASCII 0-127 范围内的字符
        if (!validChars.test(input)) {
            openNotification('bottomRight', `输入内容"${input}"包含非法字符，请检查并重新输入。`);
            return false;
        }

        return true;
    };

    useEffect(() => {
        if (code.value && code.type == 2) {
            const validValues = code.value.split(' ').filter(v => v && validateCode128Input(v));
            validValues.forEach((v, i) => {
                v && Barcode(jsBarcodeRefs[i], v, {
                    format: 'CODE128',
                    renderer: 'svg',
                    width: 2,
                    height: 100,
                    displayValue: true,
                    textAlign: 'center',
                    textPosition: 'top',
                    textMargin: 6,
                    fontSize: 20,
                    background: '#ffffff',
                    lineColor: '#000000',
                    margin: 10,
                    marginBottom: 24,
                })
            })
        }
    }, [code])

    return (
        <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 30, paddingRight: 30 }}>
            {contextHolder}
            <Input placeholder={'请输入要转码内容'} onChange={(e) => {
                codeRef.current = e.target.value
            }} />
            <div style={{ marginTop: 15 }}>
                <Button style={{ width: 100 }} onClick={() => {
                    if (!codeRef.current) {
                        openNotification('bottomRight', '请输入要转二维码的内容。')
                        return
                    }
                    setCode({ value: codeRef.current, type: 1 })
                }}>生成二维码</Button>
                <Button style={{ width: 100, marginLeft: 20 }} onClick={() => {
                    if (!codeRef.current) {
                        openNotification('bottomRight', '请输入要转条形码的内容，多个可以用空格隔开。')
                        return
                    }
                    setCode({ value: codeRef.current, type: 2 })
                }}>生成条形码</Button>
            </div>
            <div style={{ padding: 20 }}>
                {
                    code.value && code.type == 1 && code.value.split(' ').map((v, i) =>
                        v && <QRCode
                            style={{ marginRight: 50, marginBottom: 50 }}
                            value={v}// 生成二维码的内容
                            size={250} // 二维码的大小
                            fgColor="#000000" // 二维码的颜色
                            imageSettings={{ // 中间有图片logo
                                height: 60,
                                width: 60,
                                excavate: true
                            }}
                        />
                    )
                }
                <div >
                    {
                        code.value && code.type == 2 && code.value.split(' ').map((v, i) => {
                            console.log(v)
                            if (v) {
                                return (
                                    <svg key={i + ''} ref={ref => jsBarcodeRefs[i] = ref} />
                                )
                            }
                        })
                    }

                </div>
            </div>

        </div>
    )
}