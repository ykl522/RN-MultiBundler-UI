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
import AIView from './page/AIView';
import { Modal, Tabs, Table, Button, Input, Typography, Tooltip } from 'antd';
class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeKey: 'item-1',
			showJJG: false,
			showSettings: false,
			showOperation: 0,	// 0 不显示 1 新增 2 编辑
			currentSetting: {},
			projDir: workSpace,
			permission: '1',
			deepSeekKey: '',
			dataSource: [
				{ key: 'projDir', value: workSpace, isDefault: true, tip: '项目目录' },
				{ key: 'permission', value: 1, isDefault: true, tip: '权限' },
				{ key: 'deepSeekKey', value: '', isDefault: true, tip: 'DeepSeek API Key' }
			]
		}
		this.configPath = ''
	}

	arrayToJson(arr) {
		return arr.reduce((acc, item) => {
			acc[item.key] = item.value; // 将每个对象的 key 和 value 添加到结果对象中
			return acc;
		}, {});
	}

	componentDidMount() {
		ipcRenderer.send('close-loading-window', {
			isClose: true
		})
		ipcRenderer.on('JGGViewSwitch', (event) => {
			console.log('=======JGGViewSwitch========')
			this.setState({ showJJG: !this.state.showJJG })
		})
		ipcRenderer.on('settings', (event) => {
			console.log('=======settings========')
			this.setState({ showSettings: !this.state.showSettings })
		})
		ipcRenderer.on('ExePath', (event, exePath) => {
			console.log('ExePath------app.jsx-------->' + exePath)
			//拼接好安装目录下的config.json
			this.configPath = `${exePath}/config.json`;
			//使用fs读取文件内容
			const fs = require('fs');
			fs.readFile(this.configPath, 'utf-8', (err, data) => {
				if (data) {
					//注意要转换json
					const config = JSON.parse(data)
					console.log('config-------------->' + JSON.stringify(config))
					if (config) {
						console.log('config.dir-------------->' + config.dir)
						this.state.projDir = config.dir || workSpace
						this.state.permission = config.permission || 1
						this.state.deepSeekKey = config.deepSeekKey || ''
						this.state.dataSource = [
							{ key: 'projDir', value: config.dir || '', isDefault: true, tip: '项目目录' },
							{ key: 'permission', value: config.permission || 1, isDefault: true, tip: '权限' },
							{ key: 'deepSeekKey', value: config.deepSeekKey || '', isDefault: true, tip: 'DeepSeek API Key' }
						]
						this.setState({
							projDir: config.dir || '',
							permission: config.permission || 1,
							deepSeekKey: config.deepSeekKey || '',
							dataSource: this.state.dataSource
						})
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
			{ label: 'DeepSeek', key: 'item-11', children: <AIView deepSeekKey={this.state.deepSeekKey} /> },
		];
		if (this.state.showJJG) {
			items.push({ label: '九宫格', key: 'item-12', children: <JGGView /> })
		}
		let newItems = []
		if (this.state.permission) {
			newItems = items.filter(item => Number(item.key.substring(item.key.indexOf('-') + 1)) <= Number(this.state.permission))
		}
		return (
			<div>
				<Tabs
					tabBarStyle={{ paddingLeft: 30, }}
					items={newItems}
					activeKey={this.state.activeKey}
					onChange={(activeKey) => {
						this.setState({ activeKey })
					}}
				/>
				<Modal
					title="设置"
					open={this.state.showSettings}
					width={800}
					okText="保存"
					cancelText="取消"
					onOk={() => {
						this.setState({ showSettings: false })
						const result = this.arrayToJson(this.state.dataSource)
						const fs = require('fs');
						if (fs.existsSync(this.configPath)) {
							fs.writeFile(this.configPath, JSON.stringify(result), (err) => {
								if (err) {
									console.error('写入文件失败:', err);
								} else {
									console.log('写入文件成功');
									this.setState({
										projDir: result.projDir,
										permission: result.permission,
										deepSeekKey: result.deepSeekKey
									})
								}
							});
						}
					}}
					onCancel={() => {
						this.setState({ showSettings: false })
					}}
				>
					{/* <Button
						onClick={() => {

						}}
						type="primary"
						style={{
							marginBottom: 16,
						}}
					>
						新增配置项
					</Button> */}
					<Table
						columns={[
							{
								title: '配置项', dataIndex: 'key', key: 'key', render: (text, record) => {
									return (<Tooltip title={record.tip}>{text}</Tooltip>)
								}
							},
							{ title: '值', dataIndex: 'value', key: 'value', editable: true, onCell: (record) => ({ record }) },
							{
								title: '操作', dataIndex: 'operation', key: 'operation', width: '20%', render: (text, record) => {
									return (
										<span>
											{!record.isDefault ? <a
												style={{ marginRight: 8 }}
												onClick={() => {
													console.log('record------->', record)
												}}
											>
												删除
											</a> : null}
											<a
												onClick={() => {
													console.log('record------->', record)
													this.setState({ showOperation: 2, currentSetting: record })
												}}
											>
												编辑
											</a>
										</span>
									)
								}
							}
						]}
						dataSource={this.state.dataSource}
						bordered
						pagination={false}
					/>
				</Modal>
				<Modal
					title="修改配置项"
					open={this.state.showOperation}
					width={600}
					style={{
						top: 200,
					}}
					okText="确认"
					cancelText="取消"
					onOk={() => {
						const { cloneDeep } = require('lodash')
						const updatedDataSource = this.state.dataSource.map(item => {
							console.log('item------->', item)
							if (item.key === this.state.currentSetting.key) {
								item.value = this.state.currentSetting.value
							}
							return item
						})
						this.setState({
							showOperation: 0,
							dataSource: cloneDeep(updatedDataSource)
						}, () => {
							console.log('数据源已更新:', this.state.dataSource);
						});
					}}
					onCancel={() => {
						this.setState({ showOperation: 0 })
					}}
				>
					<div>
						<Typography.Title level={5}>{this.state.currentSetting.key}</Typography.Title>
						<Input
							value={this.state.currentSetting.value}
							placeholder="请输入值"
							onChange={(e) => {
								this.state.currentSetting.value = e.target.value
								this.setState({ currentSetting: { key: this.state.currentSetting.key, value: e.target.value } })
							}}
						/>
					</div>
				</Modal>
			</div>
		);
	}
}

module.exports = App;
