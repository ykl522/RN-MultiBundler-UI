/*
 * @Author: 康乐 yuankangle@gmail.com
 * @Date: 2023-01-30 17:37:10
 * @LastEditors: 康乐 yuankangle@gmail.com
 * @LastEditTime: 2023-04-12 17:14:38
 * @FilePath: \RN-MultiBundler-UI\src\page\ProjectView.js
 * @Description: 项目管理
 */
import { useState, useEffect, useRef, useMemo } from 'react';
const { Button, Modal, notification, Checkbox, Menu, Dropdown, Input, Space } = require('antd');
const { remote } = require("electron");
import { DownOutlined } from '@ant-design/icons';
import { workSpace } from '../config'
import WinExec from '../utils/WinExec';
const projDir = workSpace || __dirname;
const fs = require("fs");

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
    const [visible, setVisible] = useState(false)
    const [selectedSys, setSelectedSys] = useState(undefined)
    const [modleName, setModleName] = useState('')
    const [modlePermission, setModlePermission] = useState('')
    const dbuPDAPath = useRef('')

    const sysItems = [
        { label: 'ops', key: '0', id: 2 },
        { label: 'transport', key: '1', id: 1 },
    ]
    const menu = (
        <Menu
            selectable
            onClick={(e) => {
                if (sysItems[e.key].label) {
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

    function ensureDirectoryExistence(filePath) {
        const path = require('path');
        const dirName = path.dirname(filePath);
        if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName, { recursive: true });
        }
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
                        ensureDirectoryExistence(outputDir + "\\PDA\\");
                        ensureDirectoryExistence(outputDir + "\\PDA\\${version}\\");
                        ensureDirectoryExistence(svnDir);
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

    // 将驼峰式命名转换为下划线命名
    const camelToUnderscore = (str, isUpperCase = true) => {
        if (!str || str.length === 0) {
            return str;
        }
        if (!isUpperCase) {
            return str
                .replace(/([a-z])([A-Z])/g, '$1_$2')  // 在小写字母后的大写字母前插入下划线
                .toLowerCase();                        // 转为全小写
        }
        return str
            .replace(/([a-z])([A-Z])/g, '$1_$2')  // 在小写字母后的大写字母前插入下划线
            .toUpperCase();                         // 转为全大写
    }

    // 将字符串转换为驼峰式命名
    const toCamelCase = (str) => {
        if (str.length === 0) {
            return str;
        }
        return str.charAt(0).toLowerCase() + str.slice(1);
    }

    const getPublicString = (modelNameList, modelNoteList) => {
        const modlePermissionUpper = camelToUnderscore(modelNameList[0]);
        if (!modelNameList || modelNameList.length === 0) {
            return ""
        }
        let code = ''
        for (const index in modelNameList) {
            const modelName = modelNameList[Number(index)]
            const modelNote = modelNoteList[Number(index)];
            if (modelName) {
                code = code + `
        // ${modelNote}        
        public static final String ${camelToUnderscore(modelName)}_ACTIVITY = ${modlePermissionUpper} + "/${modelName}Activity";`;
            }
        }
        return code
    }

    const writeRouterCode = (routPth, data, modleClassName, modlePermissionUpper, modelNameList, modelNoteList) => {
        if (data) {
            if (!data.includes(`public static class ${modlePermissionUpper}`)) {
                let oldCode = data.substring(0, data.lastIndexOf('}'));
                // 生成路由配置代码
                let newCode = oldCode + `
    /**
    * ${modleName}
    */
    public static class ${modlePermissionUpper} {
        private static final String ${modlePermissionUpper} = "/ui/${selectedSys.label}/${toCamelCase(modleClassName)}";${getPublicString(modelNameList, modelNoteList)}
    }
}`
                fs.writeFileSync(routPth, newCode)
            } else {
                let oldCode = data.substring(data.indexOf(`public static class ${modlePermissionUpper} {`));
                oldCode = oldCode.substring(0, oldCode.indexOf('}') + 1);
                console.log(oldCode)
                data = data.replace(oldCode, `public static class ${modlePermissionUpper} {
        private static final String ${modlePermissionUpper} = "/ui/${selectedSys.label}/${toCamelCase(modleClassName)}";${getPublicString(modelNameList, modelNoteList)}
    }`)
                fs.writeFileSync(routPth, data)
            }
        }
    }

    const writeStringsCode = (stringsPath, data, modelNameList, modelNoteList) => {
        if (data) {
            let oldCode = data.substring(0, data.lastIndexOf('</resources>'));
            // 生成strings.xml代码
            let newCode = ""
            for (const index in modelNameList) {
                const modelName = modelNameList[Number(index)];
                const modelNote = modelNoteList[Number(index)];
                newCode = newCode + `
    <string name="${camelToUnderscore(modelName, false)}_title">${modelNote}</string>`;
            }
            newCode = oldCode + newCode + `
</resources>`;
            if (!data.includes(`<string name="${camelToUnderscore(modelNameList[0], false)}_title">`)) {
                fs.writeFileSync(stringsPath, newCode)
            }
        }
    }

    const writeXmlCode = (modelNameList, modelNoteList) => {
        for (const index in modelNameList) {
            const modelName = modelNameList[Number(index)]
            const modelNote = modelNoteList[Number(index)]
            const xmlPath = dbuPDAPath.current + '\\app\\src\\main\\res\\layout\\activity_' + camelToUnderscore(modelName, false) + '.xml';
            ensureDirectoryExistence(xmlPath);
            if (!fs.existsSync(xmlPath)) {
                fs.writeFileSync(xmlPath, `<?xml version="1.0" encoding="utf-8"?>
<layout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- ${modelNote} -->
    <data>

    </data>

    <androidx.constraintlayout.widget.ConstraintLayout
        android:layout_width="match_parent"
        android:layout_height="match_parent">    
    </androidx.constraintlayout.widget.ConstraintLayout>
</layout>`)
            }
        }
    }

    const writeActivityCode = (modelNameList, modelNoteList) => {
        const modlePermissionUpper = camelToUnderscore(modelNameList[0]);
        console.log('modelNameList--->' + modelNameList)
        for (const index in modelNameList) {
            // 4.生成Activity.java文件
            const modelName = modelNameList[Number(index)]
            const modelNote = modelNoteList[Number(index)]
            const activityPathParentParent = dbuPDAPath.current + '\\app\\src\\main\\java\\com\\zongteng\\parcelhub\\ui\\' + selectedSys.label + '\\';
            const activityPathParent = activityPathParentParent + toCamelCase(modelNameList[0]) + '\\';
            const activityPath = activityPathParent + modelName + 'Activity.java';
            ensureDirectoryExistence(activityPathParentParent);
            ensureDirectoryExistence(activityPathParent);
            ensureDirectoryExistence(activityPath);
            if (!fs.existsSync(activityPath)) {
                fs.writeFileSync(activityPath, `package com.zongteng.parcelhub.ui.${selectedSys.label}.${toCamelCase(modelNameList[0])};

import android.os.Bundle;
import com.alibaba.android.arouter.facade.annotation.Route;
import com.zongteng.parcelhub.R;
import com.zongteng.lib_network.router.RouterPath;
import com.zongteng.parcelhub.base.BaseScanActivity;
import com.zongteng.parcelhub.databinding.Activity${modelName}Binding;
import com.zongteng.parcelhub.viewModel.${selectedSys.label}.${modelNameList[0]}ViewModel;
/**
 * ${modelNote}
 */
@Route(path = RouterPath.${modlePermissionUpper}.${camelToUnderscore(modelName)}_ACTIVITY)
public class ${modelName}Activity extends BaseScanActivity<${modelNameList[0]}ViewModel, Activity${modelName}Binding> {

    @Override
    protected void onScanListener(String data) {
        
    }

    @Override
    public int initContentView(Bundle savedInstanceState) {
        return R.layout.activity_${camelToUnderscore(modelName, false)};
    }

    @Override
    public void initView() {

    }

    @Override
    public void initData(Bundle savedInstanceState) {

    }

    @Override
    public String showTitle() {
        return getString(com.zongteng.lib_res.R.string.${camelToUnderscore(modelName, false)}_title);
    }${index !== '0' ? `
     
    @Override
    public boolean isShowExitDialog() {
        return false;
    }` : ''}
}`)
            }
        }
    }

    const writeManifest = (manifestPath, data, modelNameList) => {
        if (data) {
            let oldCode = data.substring(0, data.lastIndexOf('</application>'));
            // 生成Activity注册代码
            let newCode = ""
            const modleClassName = toCamelCase(modelNameList[0]);
            for (const index in modelNameList) {
                const modelName = modelNameList[Number(index)];
                newCode = newCode + `
        <activity
            android:name=".ui.${selectedSys.label}.${modleClassName}.${modelName}Activity"
            android:configChanges="orientation|screenSize|keyboardHidden|keyboard|navigation|locale|layoutDirection|uiMode|screenLayout"
            android:exported="false"
            android:windowSoftInputMode="adjustPan"
            android:screenOrientation="portrait" />`
            }
            newCode = oldCode + newCode + `
    </application>

</manifest>`
            if (!data.includes(`android:name=".ui.${selectedSys.label}.${toCamelCase(modleClassName)}.${modelNameList[0]}Activity"`)) {
                fs.writeFileSync(manifestPath, newCode)
            }
        }
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
            modleClassName = modelNameList[0]
        } else {
            modleClassName = modlePermission
            modelNameList = [modlePermission]
        }
        if (selectedSys && selectedSys.label) {
            if (dbuPDAPath.current) {
                //-----------------路由--------------------
                const routPth = dbuPDAPath.current + '\\lib_network\\src\\main\\java\\com\\zongteng\\lib_network\\router\\RouterPath.java'
                const modlePermissionUpper = camelToUnderscore(modleClassName);
                if (fs.existsSync(routPth)) {
                    fs.readFile(routPth, 'utf8', (err, data) => {
                        writeRouterCode(routPth, data, modleClassName, modlePermissionUpper, modelNameList, modelNoteList)
                    })
                }
                //-----------------路由--------------------
                //-----------------界面--------------------
                // 1.xml文件
                writeXmlCode(modelNameList, modelNoteList);
                // 2 修改strings.xml文件
                const stringsPath = dbuPDAPath.current + '\\lib_res\\src\\main\\res\\values\\strings.xml';
                fs.readFile(stringsPath, 'utf8', (err, data) => {
                    writeStringsCode(stringsPath, data, modelNameList, modelNoteList)
                })
                // 3.生成Model文件
                const modelPathParent = dbuPDAPath.current + '\\app\\src\\main\\java\\com\\zongteng\\parcelhub\\model\\' + selectedSys.label + '\\';
                const modelPath = modelPathParent + modleClassName + 'Model.java';
                ensureDirectoryExistence(modelPathParent);
                ensureDirectoryExistence(modelPath);
                if (!fs.existsSync(modelPath)) {
                    fs.writeFileSync(modelPath, `package com.zongteng.parcelhub.model.${selectedSys.label};

import com.zongteng.parcelhub.model.UploadFileModel;

public class ${modleClassName}Model extends UploadFileModel {

}`)
                }
                // 4.生成ViewModel.java文件
                const viewModelPathParent = dbuPDAPath.current + '\\app\\src\\main\\java\\com\\zongteng\\parcelhub\\viewModel\\' + selectedSys.label + '\\';
                const viewModelPath = viewModelPathParent + modleClassName + 'ViewModel.java';
                ensureDirectoryExistence(viewModelPathParent);
                ensureDirectoryExistence(viewModelPath);
                if (!fs.existsSync(viewModelPath)) {
                    fs.writeFileSync(viewModelPath, `package com.zongteng.parcelhub.viewModel.${selectedSys.label};

import androidx.annotation.NonNull;
import android.app.Application;
import com.zongteng.module_common.model.CommonViewModel;
import com.zongteng.parcelhub.model.${selectedSys.label}.${modleClassName}Model;

public class ${modleClassName}ViewModel extends CommonViewModel<${modleClassName}Model> {
    public ${modleClassName}ViewModel(@NonNull Application application) {
        super(application);
    }
}`)
                }
                // 5.生成Activity.java文件
                writeActivityCode(modelNameList, modelNoteList);
                // 6.修改AndroidManifest.xml文件
                const manifestPath = dbuPDAPath.current + '\\app\\src\\main\\AndroidManifest.xml';
                if (fs.existsSync(manifestPath)) {
                    fs.readFile(manifestPath, 'utf8', (err, data) => {
                        writeManifest(manifestPath, data, modelNameList)
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
                    <text style={{ color: '#555' }}>模块名称：</text>
                    <Input style={{ flex: 1 }} onChange={(e) => {
                        if (e.target) {
                            setModleName(e.target.value)
                        }
                    }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: '10px' }}>
                    <text style={{ color: '#555' }}>模块权限：</text>
                    <Input style={{ flex: 1 }} onChange={(e) => {
                        if (e.target) {
                            setModlePermission(e.target.value)
                        }
                    }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: '10px' }}>
                    <text style={{ color: '#555' }}>模块系统：</text>
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