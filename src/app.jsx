/*
 * @Author: 袁康乐 yuankangle@yunexpress.cn
 * @Date: 2021-07-02 14:48:11
 * @LastEditors: 袁康乐 yuankangle@yunexpress.cn
 * @LastEditTime: 2022-11-03 15:34:55
 * @FilePath: \RN-MultiBundler-UI\src\app.jsx
 * @Description: 首页
 */
const React = require('react');

const { Tabs } = require('antd');
var _ = require('lodash');
import { workSpace } from './config'
import LanguageView from './page/LanguageView';
import PackageView from './page/PackageView';
import QRCodeView from './page/QRCodeView';
import ApiView from './page/ApiView';
import YapiJson2Ts from './page/YapiJson2Ts'
class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			activeKey: 'item-1'
		}
	}

	componentDidMount() {

	}

	render() {
		const items = [
			{ label: '打包', key: 'item-1', children: <PackageView goUpload={() => { this.setState({ activeKey: 'item-4' }) }} /> },
			{ label: '多语言', key: 'item-2', children: <LanguageView projDir={workSpace} /> },
			{ label: '二维码', key: 'item-3', children: <QRCodeView /> },
			{ label: '接口', key: 'item-4', children: <ApiView /> },
			{ label: 'YAPI转TS', key: 'item-5', children: <YapiJson2Ts /> },
		];
		return (
			<Tabs
				tabBarStyle={{ paddingLeft: 30, }}
				items={items}
				activeKey={this.state.activeKey}
				onChange={(activeKey) => {
					this.setState({ activeKey })
				}}
			/>
		);
	}
}

module.exports = App;
