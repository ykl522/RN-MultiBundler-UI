/*
 * @Author: 康乐 yuankangle@gmail.com
 * @Date: 2023-01-30 17:37:10
 * @LastEditors: 康乐 yuankangle@gmail.com
 * @LastEditTime: 2023-04-12 17:14:38
 * @FilePath: \RN-MultiBundler-UI\src\page\ProjectView.js
 * @Description: 项目管理
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
const { Button, Modal, notification, Checkbox, Menu, Dropdown, Input, Space } = require('antd');
const { remote } = require("electron");
import { DownOutlined } from '@ant-design/icons';
import { workSpace } from '../config'
import WinExec from '../utils/WinExec';
import CreateMoudle from './createModel';
const projDir = workSpace || __dirname;
const fs = require("fs");

export default function ProjectView(props) {
    const [modal, modalContextHolder] = Modal.useModal();
    const [api, contextHolder] = notification.useNotification();
    const createMoudle = CreateMoudle();
    const openNotification = (des, placement = 'bottomRight') => {
        api.info({
            message: `提示`,
            description: des,
            placement,
        });
    };
    const [projectList, setProjectList] = useState([{}])
    const [loading, setLoading] = useState(false)
    const [visible, setVisible] = useState(false)
    const [selectedSys, setSelectedSys] = useState(undefined)
    const [modleName, setModleName] = useState('')
    const [modlePermission, setModlePermission] = useState('')
    const [modleRouter, setModleRouter] = useState('')
    const dbuPDAPath = useRef('')

    const sysItems = [
        { label: 'ops', key: '0', id: 2 },
        { label: 'transport', key: '1', id: 1 },
    ]
    const menu = (
        <Menu
            selectable
            onClick={(e) => {
                if (e.key && sysItems[e.key] && sysItems[e.key].label) {
                    setSelectedSys(sysItems[e.key])
                }
            }}
            items={sysItems}
        />
    );

    /**
     * 刷新项目目录
     */
    const refreshList = () => {
        try {
            if (localStorage.projectList) {
                let localProjectList = JSON.parse(localStorage.projectList)
                for (let lp of localProjectList) {
                    if (lp.directory)
                        WinExec.cmd('git branch --show-current', lp.directory, (result) => {
                            let branch = result.toString().replace('\n', '').replace('\r', '')
                            console.log('branch==' + branch)
                            console.log('lp.branch==' + lp.branch)
                            if (lp.branch != branch) {
                                lp.branch = branch
                                let newProjectList = [...localProjectList]
                                setProjectList(newProjectList)
                                localStorage.projectList = JSON.stringify(newProjectList)
                            }
                        })
                }
                setProjectList(localProjectList)
            }
        } catch (error) {
            if (error && error.message) console.log(error.message)
        }
    }

    useMemo(() => {
        console.log('-----------------TabChange----------------')
        console.log("tabChangeKey===>" + props.tabChangeKey)
        if (props.tabChangeKey === 'item-8') {
            refreshList()
        }
    }, [props.tabChangeKey])

    // 验证项目是否勾选
    const verify = (callback) => {
        let temp = false
        for (let project of projectList) {
            if (project.isChecked && project.directory) {
                temp = true
                callback && callback(project)
            }
        }
        if (!temp) {
            openNotification("请选选中至少一个项目！")
        }
    }

    const copyApkLocalUrl = (project, isRelease) => {
        const path = require('path')
        let newDateFile = {}
        let dir = project.directory + `\\android\\app\\build\\outputs\\apk\\YT\\${isRelease ? 'release' : 'debug'}\\`
        if (!fs.existsSync(dir)) {
            dir = project.directory + `\\android\\app\\build\\outputs\\apk\\${isRelease ? 'release' : 'debug'}`
        }
        if (!fs.existsSync(dir)) {
            openNotification('文件目录不存在！')
            return
        }
        fs.readdirSync(dir).forEach(fileName => {
            const fileDir = path.join(dir, fileName)
            let stats = fs.statSync(fileDir)
            if (stats.isFile() && fileDir.endsWith('.apk')) {
                console.log(JSON.stringify(stats.atimeMs) + '**' + fileName)
                if (!newDateFile.atimeMs) {
                    newDateFile.atimeMs = stats.atimeMs
                    newDateFile.path = fileDir
                } else if (newDateFile.atimeMs < stats.atimeMs) {
                    newDateFile.atimeMs = stats.atimeMs
                    newDateFile.path = fileDir
                    console.log(JSON.stringify(stats.atimeMs) + '--' + fileName)
                }
            }
        })
        console.log(JSON.stringify(newDateFile.path) + '------------' + newDateFile.atimeMs)
        const os = require('os')
        const ifaces = os.networkInterfaces()
        let ip = ''
        for (let con in ifaces) {
            if (con == '本地链接' || con == '以太网') {
                for (let j = 0; j < ifaces[con].length; j++) {
                    if (ifaces[con][j].family == 'IPv4') {
                        ip = ifaces[con][j].address
                    }
                }
            }
        }
        // 通过package.json来获取服务端口号
        let packageJsonStr = fs.readFileSync(project.directory + path.sep + 'package.json')
        let packageJson = JSON.parse(packageJsonStr)
        let startStr = packageJson.scripts.start
        let port = startStr.substring(startStr.indexOf('--port=') + 7) || '8081'
        console.log('port--->' + port)
        let copyPath = `http://${ip}:${port}/${newDateFile.path.substring(newDateFile.path.indexOf('android\\')).replace(/\\/g, '/')}`
        let cmdStr = `CHCP 65001 && echo ${copyPath} | clip`
        console.log('copyPath------>' + copyPath)
        WinExec.cmd(cmdStr)
        openNotification(`复制${isRelease ? '线上' : '线下'}安装包的本地下载链接成功`)
    }

    // 判断是否是RN项目
    const isRNProject = (projectDirectory) => {
        if (fs.existsSync(projectDirectory + '\\package.json')) {
            return true
        }
        return false
    }

    /**
     * // 复制生产包
     * @param {object} project 项目
     * @param {string} country 国家代码 fr nl md it
     */
    const copyApk = async (project, country) => {
        if (country) {
            await fs.readdirSync(project.directory + `\\apk\\${country.toLocaleLowerCase()}_prod\\release`).forEach(fileName => {
                console.log(fileName)
                if (fileName.endsWith('.apk')) {
                    const outputDir = 'D:\\Documents\\APK\\'
                    if (!fs.existsSync(outputDir)) {
                        fs.mkdirSync(outputDir, { recursive: true })
                    }
                    const srcFile = `${project.directory}\\apk\\${country.toLocaleLowerCase()}_prod\\release\\${fileName}`
                    fs.copyFileSync(srcFile, `D:\\Documents\\APK\\${fileName}`)
                    // fr_prod_v1.9.81_45.apk
                    if (fileName.includes('_prod_v')) {
                        const version = fileName.substring(fileName.indexOf('_prod_v') + 7, fileName.lastIndexOf('_'))
                        const svnDir = `D:\\Documents\\APK\\PDA\\${version}\\${country.toLocaleUpperCase()}\\`
                        createMoudle.ensureDirectoryExistence(outputDir + "\\PDA\\");
                        createMoudle.ensureDirectoryExistence(outputDir + "\\PDA\\${version}\\");
                        createMoudle.ensureDirectoryExistence(svnDir);
                        if (!fs.existsSync(svnDir)) {
                            fs.mkdirSync(svnDir, { recursive: true });
                        }
                        fs.copyFileSync(srcFile, `${svnDir}pda-prod-release.apk`)
                        openNotification(`${fileName} 复制成功`)
                    }
                }
            })
        }
    }

    const handleCancel = () => {
        setVisible(false)
    }

    // 创建模块文件和代码
    const handleOk = () => {
        if (!modleName) {
            openNotification('请输入模块名称！')
            return
        }
        if (!modlePermission) {
            openNotification('请输入模块权限！')
            return
        }
        // 第一个模块类名
        let modleClassName = ''
        // 第一个模块名称
        let modelClassNote = ''
        // 模块权限集合
        let modelNameList = []
        // 中文列表
        let modelNoteList = []
        if (modleName.includes(',')) {
            modelNoteList = modleName.split(',')
            modelClassNote = modelNoteList[0]
        } else {
            modelClassNote = modleName
            modelNoteList = [modleName]
        }
        if (modlePermission.includes(',')) {
            modelNameList = modlePermission.split(',')
            modleClassName = createMoudle.toCamelCase(modelNameList[0], true)
        } else {
            modleClassName = createMoudle.toCamelCase(modlePermission, true)
            modelNameList = [modlePermission]
        }
        if (selectedSys && selectedSys.label) {
            if (dbuPDAPath.current) {
                //-----------------路由--------------------
                createMoudle.writeRouterCode(dbuPDAPath.current, modleName, modleRouter, modleClassName, modelNameList, modelNoteList, selectedSys)
                //-----------------路由--------------------
                //-----------------界面--------------------
                // 1.xml文件
                createMoudle.writeXmlCode(dbuPDAPath.current, modelNameList, modelNoteList);
                // 2 修改strings.xml文件
                const stringsPath = dbuPDAPath.current + '\\lib_res\\src\\main\\res\\values\\strings.xml';
                fs.readFile(stringsPath, 'utf8', (err, data) => {
                    createMoudle.writeStringsCode(stringsPath, data, modelNameList, modelNoteList)
                })
                // 生成requestBean文件
                createMoudle.writeRequestBeanCode(dbuPDAPath.current, modleRouter, modelClassNote, modleClassName);
                // 生成responseBean文件
                createMoudle.writeResponseBeanCode(dbuPDAPath.current, modleRouter, modelClassNote, modleClassName);
                createMoudle.writeApiCode(dbuPDAPath.current, modelClassNote, modleClassName, selectedSys);
                createMoudle.writeApiServiceCode(dbuPDAPath.current, modleRouter, modelClassNote, modleClassName, selectedSys);
                createMoudle.writeItemLayoutCode(dbuPDAPath.current, modleRouter, modelClassNote, modleClassName);
                createMoudle.writeAdapterCode(dbuPDAPath.current, modleRouter, modelClassNote, modleClassName, selectedSys);
                // 3.生成Model文件
                createMoudle.writeModelCode(dbuPDAPath.current, modleRouter, modleClassName, selectedSys)
                // 4.生成ViewModel.java文件
                createMoudle.writeViewModelCode(dbuPDAPath.current, modleRouter, modleClassName, selectedSys)
                // 5.生成Activity.java文件
                createMoudle.writeActivityCode(dbuPDAPath.current, modleRouter, modelNameList, modelNoteList, selectedSys);
                // 6.修改AndroidManifest.xml文件
                const manifestPath = dbuPDAPath.current + '\\app\\src\\main\\AndroidManifest.xml';
                if (fs.existsSync(manifestPath)) {
                    fs.readFile(manifestPath, 'utf8', (err, data) => {
                        createMoudle.writeManifest(manifestPath, modleRouter, data, modelNameList, selectedSys)
                        openNotification('模块创建执行完成')
                    })
                }
            }
        }

        // 关闭弹窗
        setVisible(false)
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 30, paddingRight: 30 }}>
            {modalContextHolder}
            {contextHolder}
            <div style={{ flexDirection: 'row' }}>
                <Button style={{ width: 100, marginTop: 5, marginBottom: 15 }} onClick={() => {
                    let newProjectList = [...projectList, {}]
                    setProjectList(newProjectList)
                }}>增加</Button>
                <Button style={{ width: 100, marginTop: 5, marginBottom: 15, marginLeft: 15 }} onClick={() => {
                    refreshList()
                }}>分支刷新</Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <Checkbox
                    onChange={(e) => {
                        for (let p of projectList) {
                            if (e.target.checked) {
                                p.isChecked = true
                            } else {
                                p.isChecked = false
                            }
                        }
                        let newProjectList = [...projectList]
                        setProjectList(newProjectList)
                        localStorage.projectList = JSON.stringify(newProjectList)
                    }} />
                <div style={{ width: 450, marginLeft: 10, fontWeight: 'bold', color: '#000' }}>项目目录（第一次增加后要手动选择）</div>
                <div style={{ width: 150, fontWeight: 'bold', color: '#000' }}>当前分支</div>
                <div style={{ fontWeight: 'bold', color: '#000', minWidth: 100 }}>操作</div>
            </div>
            {
                projectList.map((v, i) => {
                    v.id = i
                    return (
                        <div key={i} style={{ display: 'flex', flexDirection: 'row' }}>
                            <Checkbox
                                checked={v.isChecked}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        v.isChecked = true
                                    } else {
                                        v.isChecked = false
                                    }
                                    let newProjectList = [...projectList]
                                    setProjectList(newProjectList)
                                    localStorage.projectList = JSON.stringify(newProjectList)
                                }} />
                            <div style={{ width: 450, marginLeft: 10 }} onClick={() => {
                                remote.dialog.showOpenDialog(
                                    remote.getCurrentWindow(),
                                    {
                                        defaultPath: projDir,
                                        title: '请选择项目目录',
                                        buttonLabel: '选择',
                                        filters: undefined,
                                        properties: ['openDirectory']
                                    },
                                    (filePath) => {
                                        if (filePath) {
                                            v.directory = filePath[0];
                                            let newProjectList = [...projectList]
                                            if (v.directory) {
                                                WinExec.cmd('git branch --show-current', v.directory, (result) => {
                                                    v.branch = result.toString().replace('\n', '').replace('\r', '')
                                                    setProjectList([...newProjectList])
                                                })
                                            }
                                            localStorage.projectList = JSON.stringify(newProjectList)
                                            setProjectList(newProjectList)
                                        }
                                    }
                                )
                            }}>{v.directory || '点击选择目录'}</div>
                            <div style={{ width: 150 }}>{v.branch}</div>
                            <div style={{ color: 'blue', textDecoration: 'underline', minWidth: 100 }} onClick={() => {
                                let newProjectList = [...projectList]
                                newProjectList.splice(i, 1)
                                setProjectList(newProjectList)
                                localStorage.projectList = JSON.stringify(newProjectList)
                            }}>删除</div>
                        </div>
                    )
                })
            }
            <div style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <Button style={{ width: 100, marginTop: 15, marginBottom: 15, marginRight: 15 }} onClick={() => {
                    verify(project => {
                        WinExec.cmd('start cmd /k yarn start & echo %errorlevel%', project.directory).then((result) => {
                            if (result == 0) {
                                openNotification('启动成功')
                            } else {
                                console.log('result--->' + result)
                            }
                        }).catch((e) => {
                            openNotification('启动失败：' + e.message)
                        })
                    })
                }}>启动服务</Button>
                <Button style={{ width: 120, marginRight: 15, marginBottom: 15 }} onClick={() => {
                    verify(project => {
                        WinExec.cmd('start cmd /k npm i & echo %errorlevel%', project.directory).then((result) => {
                            if (result == 0) {
                                openNotification('下载成功')
                            } else {
                                console.log('result--->' + result)
                            }
                        }).catch((e) => {
                            openNotification('下载失败：' + e.message)
                        })
                    })
                }}>npm下载插件</Button>
                <Button style={{ width: 120, marginRight: 15, marginBottom: 15 }} onClick={() => {
                    verify(project => {
                        WinExec.cmd('start cmd /k yarn & echo %errorlevel%', project.directory).then((result) => {
                            if (result == 0) {
                                openNotification('下载成功')
                            } else {
                                console.log('result--->' + result)
                            }
                        }).catch((e) => {
                            openNotification('下载失败：' + e.message)
                        })
                    })
                }}>yarn下载插件</Button>
                <Button style={{ width: 160, marginRight: 15, marginBottom: 15 }} onClick={() => {
                    modal.confirm({
                        title: '注意',
                        okText: '删除',
                        cancelText: '取消',
                        content: <div>是否删除node_modules?</div>,
                        onOk: () => {
                            verify(project => {
                                WinExec.cmd(
                                    `del /f/s/q ${project.directory}\\node_modules\\ > nul & ` +
                                    `rmdir /s/q ${project.directory}\\node_modules\\ & ` +
                                    'echo %errorlevel%', project.directory).then((result) => {
                                        if (result == 0) {
                                            openNotification('删除成功')
                                        } else {
                                            console.log('result--->' + result)
                                        }
                                    }).catch((e) => {
                                        openNotification('删除失败：' + e.message)
                                    })
                            })
                        }
                    });
                }}>删除node_modules</Button>
                <Button style={{ width: 120, marginRight: 15, marginBottom: 15 }} onClick={() => {
                    verify(project => {
                        WinExec.cmd('git pull & echo %errorlevel%', project.directory, (result) => {
                            if (result == 0) {
                                console.log('更新成功--->' + result)
                                openNotification('更新成功')
                            } else {
                                console.log('result--->' + result)
                            }
                        }).catch((e) => {
                            openNotification('更新失败：' + e.message)
                        })
                    })
                }}>Git更新代码</Button>
                {/* </div>
            <div style={{ flexDirection: 'row' }}> */}
                <Button style={{ width: 140, marginRight: 15, marginBottom: 15 }} onClick={() => {
                    verify(project => {
                        WinExec.cmd('start cmd /k chcp 65001', project.directory)
                    })
                }}>打开项目CMD</Button>
                <Button style={{ width: 140, marginTop: 0, marginRight: 15 }} onClick={() => {
                    verify(project => {
                        remote.shell.openItem(project.directory)
                    })
                }}>打开目录文件夹</Button>
                <Button style={{ width: 140, marginTop: 0, marginRight: 15 }} onClick={() => {
                    verify(project => {
                        if (isRNProject(project.directory)) {
                            WinExec.cmd('package.json', project.directory).catch((msg) => {
                                openNotification('执行出错: ' + msg)
                            })
                        } else {
                            openNotification('没有找到package.json')
                        }
                    })
                }}>打开package.json</Button>
                <Button style={{ width: 160, marginTop: 0, marginRight: 15 }} onClick={() => {
                    verify(project => {
                        WinExec.cmd('build.gradle', project.directory + `${isRNProject(project.directory) ? '\\android' : ''}\\app\\`).catch((msg) => {
                            openNotification('执行出错: ' + msg)
                        })
                    })
                }}>打开安卓build.gradle</Button>
                {/* </div>
            <div style={{ flexDirection: 'row' }}> */}
                <Button style={{ width: 160, marginRight: 15, marginBottom: 15 }} onClick={() => {
                    verify(project => {
                        copyApkLocalUrl(project, true)
                    })
                }}>复制线上包本地链接</Button>
                <Button style={{ width: 160, marginRight: 15, marginBottom: 15 }} onClick={() => {
                    verify(project => {
                        copyApkLocalUrl(project)
                    })
                }}>复制线下包本地链接</Button>
                <Button
                    loading={loading}
                    style={{ width: 160, marginRight: 15, marginBottom: 15 }}
                    onClick={() => {
                        setLoading(true)
                        verify(project => {
                            WinExec.cmd('chcp 65001 && gradlew assembleDebug', project.directory + `${isRNProject(project.directory) ? '\\android\\' : ''}`, null, (isSuccess) => {
                                setLoading(false)
                                if (isSuccess) {
                                    openNotification('打包成功')
                                } else {
                                    openNotification('打包出错')
                                }
                            }).catch((msg) => {
                                openNotification('执行出错: ' + msg)
                            })
                        })
                    }}>安卓打包debug包</Button>
                <Button
                    loading={loading}
                    style={{ width: 160, marginRight: 15, marginBottom: 15 }}
                    onClick={() => {
                        setLoading(true)
                        verify(project => {
                            WinExec.cmd('chcp 65001 && gradlew assembleRelease', project.directory + `${isRNProject(project.directory) ? '\\android\\' : ''}`, null, (isSuccess) => {
                                setLoading(false)
                                if (isSuccess) {
                                    openNotification('打包成功')
                                } else {
                                    openNotification('打包出错')
                                }
                            }).catch((msg) => {
                                openNotification('执行出错: ' + msg)
                            })
                        })
                    }}>安卓打包release包</Button>
                <Button
                    loading={loading}
                    style={{ width: 160, marginRight: 15, marginBottom: 15 }}
                    onClick={() => {
                        verify(project => {
                            // 法国生产包
                            copyApk(project, 'fr')
                            // 荷兰生产包
                            copyApk(project, 'nl')
                            // 摩尔多瓦生产包
                            // copyApk(project, 'md')
                            // 意大利生产包
                            copyApk(project, 'it')
                            remote.shell.openItem('D:\\Documents\\APK')
                        })
                    }}>DBU_PDA复制生产包</Button>
                <Button
                    loading={loading}
                    style={{ width: 160, marginRight: 15, marginBottom: 15 }}
                    onClick={() => {
                        verify(project => {
                            if (project && project.directory && project.directory.includes('dbu-hub-pda')) {
                                dbuPDAPath.current = project.directory
                                setVisible(true)
                            } else {
                                openNotification('请在DBU_PDA项目下操作')
                            }
                        })
                    }}>DBU_PDA新增模块</Button>
            </div>
            {/* ==============================================新增模块弹框======================================== */}
            <Modal
                title="新增模块"
                visible={visible}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={handleCancel}>返回</Button>,
                    <Button key="submit" type="primary" onClick={handleOk}>创建</Button>
                ]}
            >
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <div style={{ color: '#555' }}>模块名称：</div>
                    <Input style={{ flex: 1 }} onChange={(e) => {
                        if (e.target) {
                            setModleName(e.target.value)
                        }
                    }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: '10px' }}>
                    <div style={{ color: '#555' }}>模块权限：</div>
                    <Input style={{ flex: 1 }} onChange={(e) => {
                        if (e.target) {
                            setModlePermission(e.target.value)
                        }
                    }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: '10px' }}>
                    <div style={{ color: '#555' }}>模块路由：</div>
                    <Input style={{ flex: 1 }} onChange={(e) => {
                        if (e.target) {
                            setModleRouter(e.target.value)
                        }
                    }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: '10px' }}>
                    <div style={{ color: '#555' }}>模块系统：</div>
                    <Dropdown overlay={menu} trigger={['click']} selectable>
                        <Space>
                            {selectedSys && selectedSys.label || '请选择系统'}
                            <DownOutlined />
                        </Space>
                    </Dropdown>
                </div>
            </Modal>
        </div>
    )
}