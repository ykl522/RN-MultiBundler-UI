/*
 * @Author: 康乐 yuankangle@yunexpress.cn
 * @Date: 2023-03-17 15:44:57
 * @LastEditors: 康乐 yuankangle@yunexpress.cn
 * @LastEditTime: 2023-03-17 18:45:06
 * @FilePath: \RN-MultiBundler-UI\src\page\Model.js
 * @Description: 日志
 */
import { useRef, useState, useEffect } from 'react'
import WinExec from '../utils/WinExec';
const { notification, Input, Space, Button, Dropdown, Menu } = require('antd');
import { DownOutlined } from '@ant-design/icons';

export default (props) => {
    const filtersRef = useRef()
    const [logContent, setLogContent] = useState("")
    const devices = useRef([])
    const [selectDevice, setSelectDevicce] = useState('')
    const [api, contextHolder] = notification.useNotification();
    const openNotification = (des, placement = 'bottomRight') => {
        api.info({
            message: `提示`,
            description: des,
            placement,
        });
    };

    console.log("tabChangeKey===>" + props.tabChangeKey)
    if (props.tabChangeKey == 'item-9') {
        WinExec.cmd(`nox_adb devices`, null, (data) => {
            let list = `${data}`.split('\n')
            devices.current = []
            for (let device of list) {
                if (device.trim() && !device.includes('List of devices attached')) {
                    let deviceObj = { key: devices.current.length + '', label: device.replace('device', '').trim() }
                    devices.current.push(deviceObj)
                }
            }

        })
    }

    useEffect(() => {
    }, [])

    const devicesMenu = (
        <Menu
            selectable
            onClick={(e) => {
                console.log(e.key)
                console.log(devices.current)
                if (devices.current[e.key].label) {
                    setSelectDevicce(devices.current[e.key])
                }
            }}
            items={devices.current}
        />
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 30, paddingRight: 30 }}>
            {contextHolder}
            <Space >
                <Input placeholder={'请输入要过滤内容'} onChange={(e) => {
                    filtersRef.current = e.target.value
                }} />
                <Dropdown overlay={devicesMenu} trigger={['click']} selectable>
                    <Space>
                        {selectDevice && selectDevice.label || '请选择设备'}
                        <DownOutlined />
                    </Space>
                </Dropdown>
                <Button onClick={() => {
                    if (!filtersRef || !filtersRef.current) {
                        openNotification('请输入要过滤内容!')
                    } else {
                        WinExec.cmd(`nox_adb -s ${selectDevice.label} logcat |find /I "${filtersRef.current}"`, null, (data) => {
                            // logContent += data
                            setLogContent(data)
                        })
                    }
                }}>获取日志</Button>
                <Button onClick={() => {
                    if (!filtersRef || !filtersRef.current) {
                        openNotification('请输入要过滤内容!')
                    } else {
                        WinExec.cmd(`start cmd /k "CHCP 65001 && nox_adb -s ${selectDevice.label} logcat |find /I \"${filtersRef.current}\""`, null, (data) => {
                            // logContent += data
                            setLogContent(data)
                        })
                    }
                }}>CMD获取日志</Button>
            </Space>
            <Input.TextArea rows={20} style={{ marginTop: 10 }} value={logContent} />
        </div>
    )
}