/*
 * @Author: 袁康乐 yuankangle@yunexpress.cn
 * @Date: 2021-07-02 14:48:11
 * @LastEditors: 袁康乐 yuankangle@yunexpress.cn
 * @LastEditTime: 2022-10-28 17:57:30
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
class App extends React.Component {

	constructor(props) {
		super(props);
	}

	componentDidMount() {

	}

	render() {
		const items = [
			{ label: '打包', key: 'item-1', children: <PackageView goUpload={() => { }} /> },
			{ label: '多语言', key: 'item-2', children: <LanguageView projDir={workSpace} /> },
			{ label: '二维码', key: 'item-3', children: <QRCodeView /> },
			{ label: '接口', key: 'item-4', children: <ApiView /> },
		];
		return (
			<Tabs tabBarStyle={{ paddingLeft: 30, }} items={items} />
		);
	}
}

module.exports = App;
