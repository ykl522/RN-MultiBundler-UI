/*
 * @Author: 康乐 yuankangle@gmail.com
 * @Date: 2023-03-17 15:44:57
 * @LastEditors: 康乐 yuankangle@gmail.com
 * @LastEditTime: 2023-04-11 09:42:28
 * @FilePath: \RN-MultiBundler-UI\src\page\Model.js
 * @Description: 日志
 */
import { useRef, useState, useEffect } from 'react'
import WinExec from '../utils/WinExec';
const { notification, Input, Space, Button, Dropdown, Menu } = require('antd');
import { DownOutlined } from '@ant-design/icons';
// import ffi from 'ffi-napi'

export default (props) => {
    const filtersRef = useRef()
    const [logContent, setLogContent] = useState("")
    const logContentRef = useRef({ text: '', isExe: false })
    const logTextAreaRef = useRef('')
    const [devices, setDevices] = useState([])
    const devicesRef = useRef([])
    const [selectDevice, setSelectDevicce] = useState('')
    const [api, contextHolder] = notification.useNotification();
    const openNotification = (des, placement = 'bottomRight') => {
        api.info({
            message: `提示`,
            description: des,
            placement,
        });
    };

    useEffect(() => {
        logContentRef.current.isExe = false
        // const kernel32 = ffi.Library('kernel32', { 'Beep': ['int', ['int', 'int']] })
        // kernel32.Beep(1000, 1000)
    }, [selectDevice])

    const getDevices = () => {
        if (props.tabChangeKey == 'item-9') {
            console.log('-----------------获取adb设备----------------')
            WinExec.cmd(`nox_adb devices`, null, (data) => {
                let list = `${data}`.split('\n')
                devicesRef.current = []
                for (let device of list) {
                    if (device.trim() && !device.includes('List of devices attached')) {
                        let deviceObj = { key: devicesRef.current.length + '', label: device.replace('device', '').trim() }
                        devicesRef.current.push(deviceObj)
                    }
                }
                console.log('-----------------刷新adb设备----------------' + devicesRef.current.length)
                setDevices(devicesRef.current)
            })
        }
    }

    // 日志改变时 输入框一直保持滚动到最底部
    useEffect(() => {
        if (logTextAreaRef.current && logTextAreaRef.current) {
            logTextAreaRef.current.resizableTextArea.textArea.scrollTop = logTextAreaRef.current.resizableTextArea.textArea.scrollHeight
        }
    }, [logContent])

    const devicesMenu = (
        <Menu
            selectable
            onClick={(e) => {
                console.log(e.key)
                console.log(devices)
                if (devices[e.key].label) {
                    setSelectDevicce(devices[e.key])
                }
            }}
            items={devices}
        />
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 30, paddingRight: 30 }}>
            {contextHolder}
            <Space >
                <Input placeholder={'请输入要过滤内容'} onChange={(e) => {
                    if (logContentRef.current)
                        logContentRef.current.isExe = false
                    filtersRef.current = e.target.value
                }} />
                <Dropdown
                    overlay={devicesMenu}
                    trigger={['click']}
                    selectable
                    onOpenChange={(flag) => {
                        console.log('--------onOpenChange---------' + flag)
                        if (flag) {
                            getDevices()
                        }
                    }}
                >
                    <Space>
                        {selectDevice && selectDevice.label || '请选择设备'}
                        <DownOutlined />
                    </Space>
                </Dropdown>
                <Button onClick={() => {
                    if (!filtersRef || !filtersRef.current) {
                        openNotification('请输入要过滤内容!')
                    } else {
                        if (!logContentRef.current.isExe) {
                            WinExec.cmd(`nox_adb -s ${selectDevice.label} logcat |find /I "${filtersRef.current}"`, null, (data) => {
                                logContentRef.current.isExe = true
                                logContentRef.current.text = logContentRef.current.text + data
                                setLogContent(logContentRef.current.text)
                            })
                        } else {
                            openNotification('正在获取中!')
                        }
                    }
                }}>获取日志</Button>
                <Button onClick={() => {
                    if (!filtersRef || !filtersRef.current) {
                        openNotification('请输入要过滤内容!')
                    } else {
                        WinExec.cmd(`start cmd /k "CHCP 65001 && nox_adb -s ${selectDevice.label} logcat |find /I \"${filtersRef.current}\""`, null, (data) => {
                            logContentRef.current.text = logContentRef.current.text + data
                            setLogContent(logContentRef.current.text)
                        })
                    }
                }}>CMD获取日志</Button>
                <Button onClick={() => {
                    logContentRef.current.text = ""
                    setLogContent("")
                }}>清除日志</Button>
            </Space>
            <Input.TextArea
                ref={logTextAreaRef}
                rows={20}
                style={{ marginTop: 10 }}
                value={logContent}
            />
        </div>
    )
}