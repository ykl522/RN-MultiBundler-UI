/*
 * @Author: 袁康乐 yuankangle@yunexpress.cn
 * @Date: 2022-10-24 15:11:41
 * @LastEditors: 袁康乐 yuankangle@yunexpress.cn
 * @LastEditTime: 2022-10-25 10:36:44
 * @FilePath: \RN-MultiBundler-UI\src\page\QRCodeView.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import QRCode from 'qrcode.react';
import Barcode from 'jsbarcode'
import { useState, useEffect, useRef } from 'react';
const { Button, Input } = require('antd');
let jsBarcodeRefs = []

export default function QRCodeView() {
    const codeRef = useRef()
    const [code, setCode] = useState({ value: '', type: 0 })

    useEffect(() => {
        if (code.value && code.type == 2) {
            codeRef.current && codeRef.current.split(' ').map((v, i) => {
                Barcode(jsBarcodeRefs[i], v, {
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
            <Input placeholder={'请输入'} onChange={(e) => {
                codeRef.current = e.target.value
            }} />
            <div style={{ marginTop: 15 }}>
                <Button style={{ width: 100 }} onClick={() => {
                    setCode({ value: codeRef.current, type: 1 })
                }}>生成二维码</Button>
                <Button style={{ width: 100, marginLeft: 20 }} onClick={() => {
                    setCode({ value: codeRef.current, type: 2 })
                }}>生成条形码</Button>
            </div>
            <div style={{ padding: 20 }}>
                {
                    code.value && code.type == 1 ?
                        <QRCode
                            value={code.value}// 生成二维码的内容
                            size={300} // 二维码的大小
                            fgColor="#000000" // 二维码的颜色
                            imageSettings={{ // 中间有图片logo
                                height: 60,
                                width: 60,
                                excavate: true
                            }}
                        /> : null
                }
                <div >
                    {
                        code.value && code.type == 2 && code.value.split(' ').map((v, i) => {
                            console.log(v)
                            if (v) {
                                return (
                                    <svg ref={ref => jsBarcodeRefs[i] = ref} />
                                )
                            }
                        })
                    }

                </div>
            </div>

        </div>
    )
}