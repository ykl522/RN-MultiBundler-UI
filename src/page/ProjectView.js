/*
 * @Author: 康乐 yuankangle@yunexpress.cn
 * @Date: 2023-01-30 17:37:10
 * @LastEditors: 康乐 yuankangle@yunexpress.cn
 * @LastEditTime: 2023-04-12 17:14:38
 * @FilePath: \RN-MultiBundler-UI\src\page\ProjectView.js
 * @Description: 项目管理
 */
import { useState, useEffect, useMemo } from 'react';
const { Button, Modal, notification, Checkbox } = require('antd');
const { remote } = require("electron");
import { workSpace } from '../config'
import WinExec from '../utils/WinExec';
const projDir = workSpace || __dirname;

export default function ProjectView(props) {
    const [modal, modalContextHolder] = Modal.useModal();
    const [api, contextHolder] = notification.useNotification();
    const openNotification = (des, placement = 'bottomRight') => {
        api.info({
            message: `提示`,
            description: des,
            placement,
        });
    };
    const [projectList, setProjectList] = useState([{}])
    const [loading, setLoading] = useState(false)

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
        const fs = require('fs');
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
                <div style={{ fontWeight: 'bold', color: '#000' }}>操作</div>
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
                            <div style={{ color: 'blue', textDecoration: 'underline' }} onClick={() => {
                                let newProjectList = [...projectList]
                                newProjectList.splice(i, 1)
                                setProjectList(newProjectList)
                                localStorage.projectList = JSON.stringify(newProjectList)
                            }}>删除</div>
                        </div>
                    )
                })
            }
            <div style={{ flexDirection: 'row' }}>
                <Button style={{ width: 100, marginTop: 15, marginBottom: 15 }} onClick={() => {
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
                <Button style={{ width: 120, marginLeft: 15, marginBottom: 15 }} onClick={() => {
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
                <Button style={{ width: 120, marginLeft: 15, marginBottom: 15 }} onClick={() => {
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
                <Button style={{ width: 160, marginLeft: 15, marginBottom: 15 }} onClick={() => {
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
                <Button style={{ width: 120, marginLeft: 15, marginBottom: 15 }} onClick={() => {
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
            </div>
            <div style={{ flexDirection: 'row' }}>
                <Button style={{ width: 140, marginTop: 0, marginBottom: 15 }} onClick={() => {
                    verify(project => {
                        WinExec.cmd('start cmd /k chcp 65001', project.directory)
                    })
                }}>打开项目CMD</Button>
                <Button style={{ width: 140, marginTop: 0, marginLeft: 15 }} onClick={() => {
                    verify(project => {
                        remote.shell.openItem(project.directory)
                    })
                }}>打开目录文件夹</Button>
                <Button style={{ width: 140, marginTop: 0, marginLeft: 15 }} onClick={() => {
                    verify(project => {
                        WinExec.cmd('package.json', project.directory).catch((msg) => {
                            openNotification('执行出错: ' + msg)
                        })
                    })
                }}>打开package.json</Button>
                <Button style={{ width: 160, marginTop: 0, marginLeft: 15 }} onClick={() => {
                    verify(project => {
                        WinExec.cmd('build.gradle', project.directory + '\\android\\app\\').catch((msg) => {
                            openNotification('执行出错: ' + msg)
                        })
                    })
                }}>打开安卓build.gradle</Button>
            </div>
            <div style={{ flexDirection: 'row' }}>
                <Button style={{ width: 160, marginTop: 0, marginBottom: 15 }} onClick={() => {
                    verify(project => {
                        copyApkLocalUrl(project, true)
                    })
                }}>复制线上包本地链接</Button>
                <Button style={{ width: 160, marginLeft: 15, marginBottom: 15 }} onClick={() => {
                    const fs = require('fs');
                    const path = require('path')
                    verify(project => {
                        copyApkLocalUrl(project)
                    })
                }}>复制线下包本地链接</Button>
                <Button
                    loading={loading}
                    style={{ width: 160, marginLeft: 15, marginBottom: 15 }}
                    onClick={() => {
                        setLoading(true)
                        verify(project => {
                            WinExec.cmd('chcp 65001 && gradlew assembleDebug', project.directory + '\\android\\', null, (isSuccess) => {
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
                    style={{ width: 160, marginLeft: 15, marginBottom: 15 }}
                    onClick={() => {
                        setLoading(true)
                        verify(project => {
                            WinExec.cmd('chcp 65001 && gradlew assembleRelease', project.directory + '\\android\\', null, (isSuccess) => {
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
            </div>
        </div>
    )
}