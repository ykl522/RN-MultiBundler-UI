/*
 * @Author: 袁康乐 yuankangle@yunexpress.cn
 * @Date: 2021-07-02 14:48:11
 * @LastEditors: 康乐 yuankangle@yunexpress.cn
 * @LastEditTime: 2024-05-28 09:44:59
 * @FilePath: \ops_pdad:\Git\RN-MultiBundler-UI\src\app.jsx
 * @Description: 首页
 */
const React = require('react');
const { ipcRenderer } = require('electron')
const { Tabs } = require('antd');
import { workSpace } from './config'
import LanguageView from './page/LanguageView';
import PackageView from './page/PackageView';
import QRCodeView from './page/QRCodeView';
import ApiView from './page/ApiView';
import YapiJson2Ts from './page/YapiJson2Ts'
import Md5View from './page/Md5View'
import ApkView from './page/ApkView';
import ProjectView from './page/ProjectView';
import ModelView from './page/ModelView';
import LogView from './page/LogView';
import JGGView from './page/JGGView';
import InterfaceView from './page/InterfaceView';
class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			activeKey: 'item-1',
			showJJG: false,
			projDir: workSpace,
			permission: 1
		}
	}

	componentDidMount() {
		ipcRenderer.send('close-loading-window', {
			isClose: true
		})
		ipcRenderer.on('JGGViewSwitch', (event) => {
			console.log('=======JGGViewSwitch========')
			this.setState({ showJJG: !this.state.showJJG })
		})
		ipcRenderer.on('ExePath', (event, exePath) => {
			console.log('ExePath------app.jsx-------->' + exePath)
			//拼接好安装目录下的config.json
			let configPath = `${exePath}/config.json`;
			//使用fs读取文件内容
			const fs = require('fs');
			fs.readFile(configPath, 'utf-8', (err, data) => {
				if (data) {
					//注意要转换json
					const config = JSON.parse(data)
					console.log('config-------------->' + JSON.stringify(config))
					if (config) {
						console.log('config.dir-------------->' + config.dir)
						this.state.projDir = config.dir || workSpace
						this.state.permission = config.permission || 1
						this.setState({ projDir: config.dir, permission: config.permission || 1 })
					}
				}
			})
		})
	}

	render() {
		const items = [
			{ label: '打包', key: 'item-1', children: <PackageView goUpload={() => { this.setState({ activeKey: 'item-4' }) }} /> },
			{ label: '多语言', key: 'item-2', children: <LanguageView projDir={this.state.projDir} /> },
			{ label: '二维码', key: 'item-3', children: <QRCodeView /> },
			{ label: '接口', key: 'item-4', children: <ApiView /> },
			{ label: 'YAPI转TS', key: 'item-5', children: <YapiJson2Ts /> },
			{ label: 'MD5', key: 'item-6', children: <Md5View /> },
			{ label: 'APK', key: 'item-7', children: <ApkView tabChangeKey={this.state.activeKey} /> },
			{ label: '项目管理', key: 'item-8', children: <ProjectView tabChangeKey={this.state.activeKey} /> },
			// { label: '模板', key: 'item-9', children: <ModelView /> },
			{ label: '安卓日志', key: 'item-9', children: <LogView tabChangeKey={this.state.activeKey} /> },
			{ label: '接口提取', key: 'item-10', children: <InterfaceView /> },
		];
		if (this.state.showJJG) {
			items.push({ label: '九宫格', key: 'item-11', children: <JGGView /> })
		}
		let newItems = []
		if (this.state.permission) {
			newItems = items.filter(item => Number(item.key.substring(item.key.indexOf('-') + 1)) <= this.state.permission)
		}
		return (
			<Tabs
				tabBarStyle={{ paddingLeft: 30, }}
				items={newItems}
				activeKey={this.state.activeKey}
				onChange={(activeKey) => {
					this.setState({ activeKey })
				}}
			/>
		);
	}
}

module.exports = App;
