const React = require('react');

const { Button, Checkbox, Input, Radio, Modal, Dropdown, Space, Menu, message, Tabs } = require('antd');
const CheckboxGroup = Checkbox.Group;
const { remote } = require("electron");
const { exec } = require('child_process');
import { DownOutlined } from '@ant-design/icons';
const path = require('path');
const JSZIP = require("jszip");
const fs = require("fs");
var _ = require('lodash');
const { TextArea } = Input;
const packageLockFileName = 'package-lock.json';
// const packageLockFileName = 'yarn.lock';
const packageFileName = 'package.json';
import { workSpace } from './config'
import LanguageView from './page/LanguageView';
import PackageView from './page/PackageView';
import QRCodeView from './page/QRCodeView';
// let curBinDirName = workSpace || __dirname;

// var getStackTrace = function () {
// 	var obj = {};
// 	Error.captureStackTrace(obj, getStackTrace);
// 	return obj.stack;
// };
// var log = console.log;
// console.log = function () {
// 	var stack = getStackTrace() || ""
// 	var matchResult = stack.match(/\(.*?\)/g) || []
// 	var line = matchResult[1] || ""
// 	for (var i in arguments) {
// 	}
// 	if (typeof arguments[i] == 'object') {
// 		arguments[i] = JSON.stringify(arguments[i])
// 	}
// 	arguments[i] += line.replace("(", "").replace(")", "")
// 	log.apply(console, arguments)
// };

// const sysItems = [
// 	{ label: 'prs', key: '0', },
// 	{ label: 'ots', key: '1', },
// 	{ label: 'ops', key: '2', },
// 	{ label: 'cims', key: '3', },
// 	{ label: 'rms', key: '4', },
// 	{ label: 'cis', key: '5', },
// 	{ label: 'dts', key: '6', },
// ]

// const channelItems = [
// 	{ label: 'YT', key: '0' },
// 	{ label: 'FWS', key: '1' }
// ]

// 排除部分文件或文件夹
//1 bin 2 0.58 0.59 3 demo
class App extends React.Component {

	constructor(props) {
		super(props);
		// this.state = {
		// 	platform: 'android',//平台 android iOS
		// 	env: 'false',//环境 release debug
		// 	entry: null,//打包入口
		// 	type: 'base',//基础包 插件包
		// 	bundleDir: null,//打包后bundle目录
		// 	bundleName: null,//bundle名
		// 	assetsDir: null,
		// 	deps: [],//
		// 	depsChecked: [],
		// 	cmdStr: '',
		// 	loading: false,
		// 	defaultChecked: undefined,
		// 	entryErrorIndex: 0,
		// 	entryErrorIndexs: [],
		// 	visible: false,
		// 	selectedSys: undefined,
		// 	selectedChannel: 'YT',
		// 	packageStaus: 0	//0默认没有打包 1打包中 2打包成功 -1打包失败
		// };
		// this.onDepCheckChange = this.onDepCheckChange.bind(this);
		// this.selectFile = this.selectFile.bind(this);
		// this.renderFileSelect = this.renderFileSelect.bind(this);
		// this.renderItem = this.renderItem.bind(this);
		// this.render = this.render.bind(this);
		// this.renderPlatformSelect = this.renderPlatformSelect.bind(this);
		// this.renderEnvSelect = this.renderEnvSelect.bind(this);
		// this.fileSelected = this.fileSelected.bind(this);
		// this.renderTypeSelect = this.renderTypeSelect.bind(this);
		// this.renderBundleName = this.renderBundleName.bind(this);
		// this.startPackage = this.startPackage.bind(this);
		// this.startAndroidPackage = this.startAndroidPackage.bind(this);
		// this.initDir = this.initDir.bind(this);

		// this.entrys = [];
		// this.entryIndex = 0;
	}

	componentDidMount() {
		// let openType = 'openDirectory';
		// let filter = undefined;
		// let title = '清选择RN工程目录';
		// // setTimeout(() => {
		// // 	this.initDir(curBinDirName)
		// // }, 2000)
		// remote.dialog.showOpenDialog(
		// 	remote.getCurrentWindow(),
		// 	{
		// 		defaultPath: curBinDirName,
		// 		title: title,
		// 		buttonLabel: '选择',
		// 		filters: filter,
		// 		properties: [openType]
		// 	},
		// 	(filePath) => {
		// 		if (filePath) {
		// 			const directory = filePath[0];
		// 			this.initDir(directory);
		// 		}
		// 	}
		// )
	}

	// initDir(curDir) {
	// 	//load lock.json
	// 	//const curDir = curBinDirName;
	// 	console.log('curDir', path.dirname(curDir));
	// 	let dirTmp = curDir;
	// 	while (dirTmp.length > 2) {
	// 		console.log('curDir', dirTmp);
	// 		let packageLockFile = path.join(dirTmp, packageLockFileName);
	// 		let packageJsonFile = path.join(dirTmp, packageFileName);
	// 		if (fs.existsSync(packageLockFile)) {
	// 			console.log('package-lock.json', packageLockFile);
	// 			this.projDir = dirTmp;//要分包的项目目录
	// 			this.projPackageDir = dirTmp;
	// 			this.packageFilePath = packageJsonFile;//packageJson
	// 			this.packageFileLockPath = packageLockFile;
	// 			break;
	// 		}
	// 		dirTmp = path.dirname(dirTmp);
	// 	}
	// 	console.log('projDir', this.projDir);
	// 	if (this.packageFilePath != null) {
	// 		this.state.assetsDir = this.projPackageDir + path.sep + 'android\\app\\src\\main\\res'
	// 		this.state.bundleDir = this.projPackageDir + path.sep + 'android\\app\\src\\main\\assets'
	// 		this.setState({ entry: this.projPackageDir + path.sep + 'platformDep-ui.js' });
	// 		fs.readFile(this.packageFilePath, 'utf8', (err, fileContent) => {
	// 			if (err) {
	// 				if (err.code === 'ENOENT') {
	// 					return
	// 				}
	// 				throw new Error(err)
	// 			}

	// 			const content = JSON.parse(fileContent);
	// 			let deps = content['dependencies'];
	// 			this.depsStrs = Object.keys(deps);
	// 			let depsArray = Object.keys(deps);
	// 			// this.state.defaultChecked = Object.keys(deps)
	// 			for (let i = 0; i < depsArray.length; i++) {
	// 				let depStr = depsArray[i];
	// 				if (depStr == 'react' || depStr == 'react-native') {
	// 					depsArray[i] = { value: depStr, label: depStr, check: true, disabled: true };
	// 				}
	// 			}
	// 			this.setState({ deps: depsArray });
	// 			console.log('package json content', content);
	// 		});
	// 	} else {
	// 		alert('请在先在目标工程执行npm install再进入程序，或者选择正确的工程目录');
	// 	}
	// 	const fixPath = require('fix-path');
	// 	fixPath();
	// }

	// renderItem(name, item) {
	// 	return (<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: name ? '12px' : 0, marginRight: '12px' }}>
	// 		{name ? <div style={{ marginRight: '10px' }}>{name + ' :  '}</div> : null}
	// 		<div style={{ display: 'flex', flexDirection: 'row' }}>{item}</div>
	// 	</div>)
	// }

	// renderItema(name, item) {
	// 	return (<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: '12px' }}>
	// 		<div style={{ marginRight: '10px' }}>{name + ' :  '}</div>
	// 		<div style={{ display: 'flex', flexDirection: 'row', maxWidth: 900, overflow: 'hidden', textOverflow: 'ellipsis', flexWrap: 'wrap' }}>{item}</div>
	// 	</div>)
	// }

	// renderPlatformSelect() {
	// 	return (<Radio.Group defaultValue="android" buttonStyle="solid"
	// 		onChange={(e) => {
	// 			console.log('renderPlatformSelect---> ' + e.target.value);
	// 			this.state.platform = e.target.value
	// 			this.setState({ platform: e.target.value });
	// 		}}>
	// 		<Radio.Button value="android">Android</Radio.Button>
	// 		<Radio.Button value="ios">iOS</Radio.Button>
	// 	</Radio.Group>);
	// }
	// renderEnvSelect() {
	// 	return (<Radio.Group defaultValue="false" buttonStyle="solid"
	// 		onChange={(e) => {
	// 			console.log('renderEnvSelect', e);
	// 			this.setState({ env: e.target.value });
	// 		}}>
	// 		<Radio.Button value="false">Release</Radio.Button>
	// 		<Radio.Button value="true">Debug</Radio.Button>
	// 	</Radio.Group>);
	// }
	// renderTypeSelect() {
	// 	return (<Radio.Group defaultValue="base" buttonStyle="solid"
	// 		onChange={(e) => {
	// 			console.log('renderEnvSelect-->' + JSON.stringify(e));
	// 			try {
	// 				if (e && e.target)
	// 					this.state.type = e.target.value
	// 				if (e && e.target && e.target.value == 'base') {
	// 					let temp = 0
	// 					for (let dep of this.state.depsChecked) {
	// 						if (dep == 'react' || dep == 'react-native') {
	// 							temp++
	// 						}
	// 					}
	// 					if (temp != 2) {
	// 						this.state.depsChecked = ['react', 'react-native']
	// 					}
	// 					this.setState({ entry: this.projPackageDir + path.sep + 'platformDep-ui.js' });
	// 				} else {
	// 					this.setState({ entry: '' });
	// 					for (let i = 0; i < this.state.depsChecked.length; i++) {
	// 						let dep = this.state.depsChecked[i]
	// 						if (dep == 'react' || dep == 'react-native') {
	// 							this.state.depsChecked.splice(i--, 1);
	// 						}
	// 					}
	// 				}
	// 				// this.setState({ type: e.target.value });
	// 				// if (e.target.value == 'base') {
	// 				//   this.setState({ entry: this.projPackageDir + path.sep + 'platformDep-ui.js' });
	// 				// } else {
	// 				//   this.setState({ entry: '' });
	// 				// }
	// 			} catch (e) {
	// 				alert(e)
	// 			}
	// 		}}
	// 	>
	// 		<Radio.Button value="base">基础包</Radio.Button>
	// 		<Radio.Button value="buz">插件包</Radio.Button>
	// 	</Radio.Group>);
	// }
	// renderFileSelect(id) {
	// 	let buttonName = '选择目录';
	// 	if (id == 'entry') {//file
	// 		buttonName = '选择文件';
	// 		if (this.state.entry) {
	// 			buttonName = this.state.entry;
	// 		}
	// 	} else if (id == 'bundle') {
	// 		if (this.state.bundleDir) {
	// 			buttonName = this.state.bundleDir;
	// 		}
	// 	} else if (id == 'assets') {
	// 		if (this.state.assetsDir) {
	// 			buttonName = this.state.assetsDir;
	// 		}
	// 	}
	// 	return (<Button onClick={_ => this.selectFile(id)} block>{buttonName}</Button>);
	// }

	// fileSelected(id, path) {
	// 	if (id == 'entry') {//file
	// 		this.setState({ entry: path });
	// 	} else if (id == 'bundle') {
	// 		this.setState({ bundleDir: path });
	// 	} else if (id == 'assets') {
	// 		this.setState({ assetsDir: path });
	// 	}
	// }

	// selectFile(id) {
	// 	let openType = 'openDirectory';
	// 	let title = '选择';
	// 	let filter = undefined;
	// 	if (id == 'entry') {
	// 		// openType = 'openFile';

	// 		openType = 'multiSelections';


	// 		title = '打包入口文件选择';
	// 		filter = [
	// 			{
	// 				extensions: ['js']
	// 			}
	// 		]
	// 	} else if (id == 'bundle') {
	// 		title = '打包bundle目录选择';
	// 	} else if (id == 'assets') {
	// 		title = '打包资源目录选择';
	// 	}
	// 	console.log('projDir', this.projDir);
	// 	remote.dialog.showOpenDialog(
	// 		remote.getCurrentWindow(),
	// 		{
	// 			defaultPath: this.projDir + (id == 'entry' ? '\\indexs' : ''),
	// 			title: title,
	// 			buttonLabel: '选择',
	// 			filters: filter,
	// 			properties: [openType]
	// 		},
	// 		(filePath) => {
	// 			if (filePath) {
	// 				let directory = filePath[0];
	// 				if (id == 'entry') {
	// 					directory = filePath.join(",,");
	// 				}
	// 				this.fileSelected(id, directory);
	// 			}
	// 		}
	// 	)
	// }

	// renderBundleName() {
	// 	return (<Input ref={(componentInput) => { this.bundleNameInput = componentInput }} />);
	// }

	// onDepCheckChange(e) {
	// 	const { type } = this.state;
	// 	if (type == 'buz') {
	// 		e = e.filter((value) => !(value == 'react' || value == 'react-native'));
	// 	}
	// 	console.log(JSON.stringify(e));
	// 	this.setState({ depsChecked: e });
	// }

	// renderDep1() {
	// 	const { deps, depsChecked, type } = this.state;
	// 	let options = deps;
	// 	let defaultChecked = ['react', 'react-native'];
	// 	if (type == 'buz') {//插件包不可能把react打进去
	// 		options = options.filter((value) => !(value == 'react' || value == 'react-native'
	// 			|| value.value == 'react' || value.value == 'react-native'));
	// 		defaultChecked = undefined;
	// 	}
	// 	return <CheckboxGroup options={options} onChange={this.onDepCheckChange} defaultValue={defaultChecked} />
	// }

	// renderDep() {
	// 	const { deps, type } = this.state;
	// 	let options = [...deps];
	// 	if (type != 'buz' && (!this.state.depsChecked || this.state.depsChecked.length == 0)) {
	// 		this.state.depsChecked = ['react', 'react-native'];
	// 		console.log('---' + this.state.depsChecked)
	// 	}
	// 	// this.state.depsChecked.push('moment')
	// 	if (type == 'buz') {//插件包不可能把react打进去
	// 		options = options.filter((value) => !(value == 'react' || value == 'react-native'
	// 			|| value.value == 'react' || value.value == 'react-native'));
	// 	}
	// 	// alert(JSON.stringify(this.state.defaultChecked, null, 2))
	// 	return <CheckboxGroup
	// 		options={options}
	// 		onChange={this.onDepCheckChange}
	// 		value={this.state.depsChecked}
	// 	/>

	// }

	// getAllDeps(platformDepArray, lockDeps) {
	// 	let allPlatformDep = [];
	// 	let travelStack = [...platformDepArray];
	// 	while (travelStack.length != 0) {
	// 		let depItem = travelStack.pop();
	// 		allPlatformDep.push(depItem);
	// 		console.log('depItem==> ' + depItem);
	// 		let depDetail = lockDeps[depItem];
	// 		if (depDetail == null) {
	// 			console.log('depItem no found', depItem);
	// 			continue;
	// 		}
	// 		let depReq = depDetail['requires'];
	// 		if (depReq != null) {
	// 			travelStack = travelStack.concat(_.difference(Object.keys(depReq), allPlatformDep));//difference防止循环依赖
	// 		}
	// 	}
	// 	console.log('allPlatformDep: ' + JSON.stringify(allPlatformDep));
	// 	return _.uniq(allPlatformDep);
	// }


	// startPackage() {
	// 	const { entry } = this.state;
	// 	if (entry == null) {
	// 		alert("请选择打包的js入口");
	// 		return;
	// 	}
	// 	this.entrys = entry.split(",,");
	// 	this.entryIndex = 0;
	// 	if (this.entrys.length > 0) {
	// 		this.state.entryErrorIndex = 0;
	// 		this.state.entryErrorIndexs = []
	// 		this.loopPackage();
	// 	}

	// }

	// startAndroidPackage() {
	// 	this.setState({ loading: true, cmdStr: '' });
	// 	// let cmdStr = './android/gradlew assembleRelease'
	// 	let assembleRelease = this.state.selectedChannel == 'FWS' ? 'assembleFWSRelease' : 'assembleYTRelease'
	// 	let cmdStr = 'chcp 65001 && ' + this.projDir + '\\android\\gradlew ' + assembleRelease
	// 	const iconv = require('iconv-lite')
	// 	this.state.packageStaus = 1
	// 	let packageProcess = exec(cmdStr, { cwd: this.projDir + '\\android', encoding: 'buffer' }, (error, stdout, stderr) => {
	// 		this.setState({ loading: false });
	// 		if (error) {
	// 			this.state.packageStaus = -1
	// 			message.error('打安装包出错！')
	// 			console.error(`执行出错: ${iconv.decode(error.message, 'cp936')}`);
	// 			this.setState({ cmdStr: error });
	// 			// return;
	// 		} else {
	// 			this.state.packageStaus = 2
	// 			this.setState({ packageStaus: 2 });
	// 			message.info('打安装包完成！')
	// 		}
	// 		console.log(`stdout: ${iconv.decode(stdout, 'CP936')}`);
	// 		console.log(`stderr: ${iconv.decode(stderr, 'CP936')}`);
	// 	});
	// 	packageProcess.stdout.on('data', (data) => {
	// 		console.log(`stdout: ${data}`);
	// 		let cmdRetStrs = data + this.state.cmdStr;
	// 		this.state.cmdStr = cmdRetStrs
	// 		this.setState({ cmdStr: cmdRetStrs });
	// 	});
	// }

	// loopPackage() {
	// 	if (this.entryIndex >= this.entrys.length) {
	// 		this.setState({})
	// 		return;
	// 	}

	// 	const entry = this.entrys[this.entryIndex];

	// 	console.log("*************** package  run  no ** " + (this.entryIndex + 1) + " pkg: " + entry);

	// 	this.setState({ cmdStr: '' });
	// 	const { platform, env, type, bundleDir, assetsDir, depsChecked } = this.state;
	// 	console.log("-----getModuleVersion----" + this.getModuleVersion(entry))
	// 	let bundleName = this.bundleNameInput.input.value ||
	// 		(type == 'buz' ?
	// 			(entry.substring(entry.lastIndexOf('index'), entry.indexOf('.js')) + `_V${this.versionInput.input.value || this.getModuleVersion(entry) || '0'}.android.bundle`)
	// 			: 'platform.android.bundle');
	// 	this.state.bundleName = bundleName
	// 	console.log(type + '------------------' + (bundleName))
	// 	// console.log('bundleName', bundleName
	// 	//   , 'platform', platform, 'env', env, 'entry', entry, 'type', type, 'bundleDir', bundleDir, 'assetsDir', assetsDir
	// 	//   , 'depsChecked', depsChecked);
	// 	if (entry == null) {
	// 		alert("请选择打包的js入口");
	// 		return;
	// 	}
	// 	if (bundleDir == null) {
	// 		alert("请选择jsbundle的目标目录");
	// 		return;
	// 	}
	// 	if (bundleName == null) {
	// 		alert("请选择jsbundle的文件名称");
	// 		return;
	// 	}
	// 	if (assetsDir == null) {
	// 		alert("请选择资源文件的目标目录");
	// 		return
	// 	}
	// 	let bundleConifgName;
	// 	let platformDepJsonPath = this.projPackageDir + path.sep + 'platformDep.json';
	// 	if (type == 'base') {
	// 		bundleConifgName = 'platform-ui.config.js';
	// 		fs.writeFileSync(platformDepJsonPath, JSON.stringify(depsChecked), 'utf8');
	// 		let platformDepImportPath = this.projPackageDir + path.sep + 'platformDep-import.js';
	// 		let importStr = '';
	// 		depsChecked.forEach((moduleStr) => {
	// 			importStr = importStr + 'import \'' + moduleStr + '\'\n';
	// 		});
	// 		fs.writeFileSync(platformDepImportPath, importStr, 'utf8');
	// 	} else {
	// 		bundleConifgName = 'buz-ui.config.js';
	// 		const platformDepArray = require(platformDepJsonPath);
	// 		if (!Array.isArray(platformDepArray)) {
	// 			alert("必须先打基础包");
	// 			return;//必须先打基础包
	// 		}
	// 		if (depsChecked.length > 0) {//需要过滤platformDepArray
	// 			const packageLockObj = require(this.packageFileLockPath);
	// 			const lockDeps = packageLockObj['dependencies'];
	// 			console.log('start deal platform dep');
	// 			let allPlatformDep = this.getAllDeps(platformDepArray, lockDeps);
	// 			console.log('start deal buz dep');
	// 			let allBuzDep = this.getAllDeps(depsChecked, lockDeps);
	// 			let filteredBuzDep = _.difference(allBuzDep, allPlatformDep);
	// 			let buzDepJsonPath = this.projPackageDir + path.sep + 'buzDep.json';//业务包依赖的路径
	// 			fs.writeFileSync(buzDepJsonPath, JSON.stringify(filteredBuzDep));//todo 打包脚本读取该数组
	// 		}
	// 	}
	// 	let cmdStr = 'node ./node_modules/react-native/local-cli/cli.js bundle  --platform ' + platform
	// 		+ ' --dev ' + env + ' --entry-file ' + entry + ' --bundle-output ' + bundleDir + path.sep + bundleName
	// 		+ ' --assets-dest ' + assetsDir + ' --config ' + this.projPackageDir + path.sep + bundleConifgName;
	// 	console.log(cmdStr)
	// 	this.setState({ loading: true });
	// 	this.state.cmd = cmdStr
	// 	// alert(cmdStr)
	// 	let packageProcess = exec(cmdStr, { cwd: this.projDir }, (error, stdout, stderr) => {
	// 		this.setState({ loading: false });
	// 		if (error) {
	// 			console.error(`执行出错: ${error}`);
	// 			this.state.entryErrorIndex++;
	// 			this.state.entryErrorIndexs.push(entry.substring(entry.lastIndexOf('index'), entry.indexOf('.js')))
	// 			this.setState({ cmdStr: error });
	// 			// return;
	// 		}
	// 		console.log(`stdout: ${stdout}`);
	// 		console.log(`stderr: ${stderr}`);
	// 		this.entryIndex++;
	// 		this.loopPackage();
	// 	});
	// 	packageProcess.stdout.on('data', (data) => {
	// 		console.log(`stdout: ${data}`);
	// 		let cmdRetStrs = data + this.state.cmdStr;
	// 		this.setState({ cmdStr: cmdRetStrs });
	// 	});

	// }

	// // zip 递归读取文件夹下的文件流
	// readDir(zip, nowPath) {
	// 	// 读取目录中的所有文件及文件夹（同步操作）
	// 	console.log('----------read-----------')
	// 	let files = fs.readdirSync(nowPath)
	// 	//遍历检测目录中的文件
	// 	files.filter(name => !name.includes('.zip')).forEach((fileName, index) => {
	// 		// 打印当前读取的文件名
	// 		console.log(fileName, index)
	// 		// 当前文件的全路径
	// 		let fillPath = path.join(nowPath, fileName)
	// 		// 获取一个文件的属性
	// 		let file = fs.statSync(fillPath)
	// 		// 如果是目录的话，继续查询
	// 		if (file.isDirectory()) {
	// 			// 压缩对象中生成该目录
	// 			let dirlist = zip.folder(fileName)
	// 			// （递归）重新检索目录文件
	// 			this.readDir(dirlist, fillPath)
	// 		} else {
	// 			// 压缩目录添加文件
	// 			zip.file(fileName, fs.readFileSync(fillPath))
	// 		}
	// 	})
	// 	console.log('+---------read----------+')
	// }

	// deleteDir(nowPath) {
	// 	// 读取目录中的所有文件及文件夹（同步操作）
	// 	let files = fs.readdirSync(nowPath)
	// 	//遍历检测目录中的文件
	// 	console.log('----------delete-----------')
	// 	files.filter(name => !name.includes('.zip')).forEach((fileName, index) => {
	// 		// 打印当前读取的文件名
	// 		// 当前文件的全路径
	// 		let fillPath = path.join(nowPath, fileName)
	// 		// 获取一个文件的属性
	// 		let file = fs.statSync(fillPath)
	// 		// 如果是目录的话，继续查询
	// 		if (file.isDirectory()) {
	// 			// （递归）重新检索目录文件
	// 			this.deleteDir(fillPath)
	// 			fs.rmdirSync(fillPath)
	// 			console.log(fileName)
	// 		} else {
	// 			// 删除文件
	// 			fs.unlinkSync(fillPath)
	// 			console.log(index + "---" + fileName)
	// 		}
	// 	})
	// 	console.log('+---------delete----------+')
	// }

	// // 开始压缩文件
	// zipFolder(target = __dirname, output = __dirname + '/result.zip') {
	// 	// 创建 zip 实例
	// 	const zip = new JSZIP()
	// 	// zip 递归读取文件夹下的文件流
	// 	this.readDir(zip, target)
	// 	// 设置压缩格式，开始打包
	// 	zip.generateAsync({
	// 		// nodejs 专用
	// 		type: 'nodebuffer',
	// 		// 压缩算法
	// 		compression: 'DEFLATE',
	// 		// 压缩级别
	// 		compressionOptions: { level: 9, },
	// 	}).then(content => {
	// 		// 将打包的内容写入 当前目录下的 result.zip中
	// 		fs.writeFileSync(output, content, 'utf-8')

	// 	}).catch(e => {
	// 		alert(e)
	// 	})
	// }

	// formatZero(num, len) {
	// 	if (String(num).length > len) return num;
	// 	return (Array(len).join(0) + num).slice(-len);
	// }

	// //更新Map版本号
	// updateModuleIdConfig(inputValue) {
	// 	if (!inputValue) inputValue = '0'
	// 	//只取两位
	// 	if (inputValue && inputValue.length > 2) inputValue = inputValue.substring(0, 2)
	// 	let configPath = curBinDirName + path.sep + 'multibundler' + path.sep + 'ModuleIdConfig.json'
	// 	let json = fs.readFileSync(configPath, 'utf8')
	// 	let config = JSON.parse(json)
	// 	let selectFileName = this.state.entry + ''
	// 	const id = selectFileName.substring(selectFileName.lastIndexOf('index') + 5, selectFileName.indexOf('.js'))
	// 	config[selectFileName.substring(selectFileName.lastIndexOf('\\') + 1)] = Number(id + this.formatZero(inputValue, 2) + '000')
	// 	let newJson = JSON.stringify(config, null, 2)
	// 	// alert(newJson)
	// 	fs.writeFileSync(configPath, newJson, 'utf8')
	// 	fs.unlinkSync(curBinDirName + path.sep + 'multibundler' + path.sep + 'index' + id + 'Map.json')
	// }

	// //获取Map里面版本号
	// getModuleVersion(selectFileName) {
	// 	let configPath = curBinDirName + path.sep + 'multibundler' + path.sep + 'ModuleIdConfig.json'
	// 	let json = fs.readFileSync(configPath, 'utf8')
	// 	let config = JSON.parse(json)
	// 	console.log("selectFileName--->" + selectFileName)
	// 	const moduleInfo = config[selectFileName.substring(selectFileName.lastIndexOf('\\') + 1)] + ""
	// 	console.log("moduleInfo--->" + moduleInfo)
	// 	return Number(moduleInfo.substring(moduleInfo.length - 5, moduleInfo.length - 3)) + ""
	// }

	// //清空原配置
	// cleanConfig() {
	// 	let multibundlerPath = curBinDirName + path.sep + 'multibundler' + path.sep
	// 	let mainConfig = multibundlerPath + 'platformMap.json'
	// 	fs.writeFileSync(mainConfig, "[]", 'utf8')
	// 	let files = fs.readdirSync(multibundlerPath)
	// 	files.filter(name => name.includes('Map.json') && name.includes('index')).forEach((fileName, index) => {
	// 		let fillPath = path.join(multibundlerPath, fileName)
	// 		fs.unlinkSync(fillPath)
	// 	})
	// 	alert("清除完成，请重新打基础包和插件包")
	// }

	// handleOk() {
	// 	let { selectedSys, modlePermission, modleName } = this.state
	// 	if (!modleName) {
	// 		message.info('请输入模块名称！')
	// 		return
	// 	}
	// 	if (!modlePermission) {
	// 		message.info('请输入模块权限！')
	// 		return
	// 	}
	// 	if (selectedSys) {
	// 		let jsonPath = this.projPackageDir + path.sep + 'android\\app\\src\\main\\assets\\data\\menu.json'
	// 		let jsonStr = fs.readFileSync(jsonPath, 'utf8')
	// 		let menuList = JSON.parse(jsonStr)
	// 		if (selectedSys == 'prs') {
	// 			selectedSys = 'Collection'
	// 		} else {
	// 			selectedSys = selectedSys.toLocaleUpperCase()
	// 		}
	// 		let newMoudle = { id: 0 }
	// 		for (let menuInfo of menuList) {
	// 			if (menuInfo.permission == selectedSys) {
	// 				// alert(JSON.stringify(menuInfo.childData, null, 2))
	// 				for (let menuChild of menuInfo.childData) {
	// 					if (menuChild.id >= newMoudle.id) {
	// 						newMoudle = {
	// 							childName: modleName,
	// 							permission: modlePermission,
	// 							parent: selectedSys,
	// 							resKey: 'model_' + modlePermission.replace(/([A-Z])/g, '_$1').toLocaleLowerCase(),
	// 							id: menuChild.id + 1,
	// 							version: 0
	// 						}
	// 					}
	// 				}
	// 				menuInfo.childData.push(newMoudle)
	// 			}
	// 		}
	// 		fs.writeFileSync(jsonPath, JSON.stringify(menuList, null, 2), 'utf-8')
	// 		this.state.selectedSys = this.state.selectedSys.toLocaleLowerCase()
	// 		if (this.state.selectedSys == 'cims') {
	// 			this.state.selectedSys = 'cims2'
	// 		}
	// 		let clasePackageName = modlePermission.charAt(0).toLocaleLowerCase() + modlePermission.slice(1, modlePermission.indexOf('Page'))
	// 		let classPath = this.projPackageDir + path.sep + 'app\\page\\' + this.state.selectedSys + '\\' + clasePackageName
	// 		if (!fs.existsSync(classPath))
	// 			fs.mkdirSync(classPath)
	// 		fs.writeFileSync(classPath + '\\index.tsx', "import React from 'react'" + '\n'
	// 			+ "import { NavigationContainer } from '@react-navigation/native';" + '\n'
	// 			+ "import { createStackNavigator } from '@react-navigation/stack';" + '\n'
	// 			+ "const Stack = createStackNavigator();" + '\n'
	// 			+ "const APP = (props: any) => {" + '\n'
	// 			+ "\treturn (" + '\n'
	// 			+ "\t\t<NavigationContainer>" + '\n'
	// 			+ "\t\t\t<Stack.Navigator>" + '\n'
	// 			+ "\t\t\t</Stack.Navigator>" + '\n'
	// 			+ "\t\t</NavigationContainer>" + '\n'
	// 			+ "\t);" + '\n'
	// 			+ "}" + '\n\n'
	// 			+ "export default APP;"
	// 		)
	// 		let indexPath = this.projPackageDir + path.sep + 'indexs\\index' + newMoudle.id + '.js'
	// 		fs.writeFileSync(indexPath, "import { AppRegistry } from 'react-native';" + '\n'
	// 			+ "import { AppWrapper } from '../baseApp';" + '\n'
	// 			+ "import " + modlePermission + " from '../app/page/" + this.state.selectedSys + '/' + modlePermission.charAt(0).toLocaleLowerCase() + modlePermission.slice(1) + "'\n"
	// 			+ "AppRegistry.registerComponent('yunexpress_app_" + newMoudle.id + "', () => AppWrapper(" + modlePermission + "));")

	// 		let yunExpressIndexPath = this.projPackageDir + path.sep + 'YunExpressIndex.js'
	// 		let yunExpressIndexFile = fs.readFileSync(yunExpressIndexPath, 'utf8')
	// 		// let codeLines = yunExpressIndexFile.split('\r')
	// 		// for(let line of codeLines){
	// 		// }
	// 		let lastSysImportToEnd = yunExpressIndexFile.substring(yunExpressIndexFile.lastIndexOf('./app/page/' + this.state.selectedSys))
	// 		let lastSysImport = lastSysImportToEnd.substring(0, lastSysImportToEnd.indexOf('\r'))

	// 		let newImport = lastSysImport + '\r' + `import ${modlePermission} from './app/page/${this.state.selectedSys + '/' + clasePackageName}/index';`
	// 		yunExpressIndexFile = yunExpressIndexFile.replace(lastSysImport, newImport)
	// 		let constSysAppsFunciotnToEnd = yunExpressIndexFile.substring(yunExpressIndexFile.indexOf(`const ${this.state.selectedSys}Apps = {`))
	// 		let constSysAppsFunciotn = constSysAppsFunciotnToEnd.substring(0, constSysAppsFunciotnToEnd.indexOf('}'))
	// 		let newFuncion = constSysAppsFunciotn + `	yunexpress_app_${newMoudle.id}: ${modlePermission}, //${modleName}\r`
	// 		yunExpressIndexFile = yunExpressIndexFile.replace(constSysAppsFunciotn, newFuncion)
	// 		fs.writeFileSync(yunExpressIndexPath, yunExpressIndexFile, 'utf-8')
	// 		message.info('创建模块成功')
	// 	} else {
	// 		message.info('请选择系统！')
	// 		return
	// 	}
	// 	this.setState({ visible: false, selectedSys: undefined })
	// }

	// handleCancel() {
	// 	this.setState({ visible: false, selectedSys: undefined })
	// }

	// /**
	//  * 获取打包按钮属性
	//  */
	// getPackageBtnText() {
	// 	let btnText = { name: '打安装包', color: '#555' }
	// 	switch (this.state.packageStaus) {
	// 		case 0:
	// 		case 1:
	// 			btnText = { name: '打安装包', color: '#555' }
	// 			break
	// 		case 2:
	// 			btnText = { name: '打包成功', color: 'green' }
	// 			break
	// 		case -1:
	// 			btnText = { name: '打包失败', color: 'red' }
	// 			break
	// 	}
	// 	return btnText;
	// }

	render() {
		const items = [
			// { label: '打包', key: 'item-1', children: this.packageView() }, // 务必填写 key
			{ label: '打包', key: 'item-1', children: <PackageView /> }, // 务必填写 key
			// { label: '多语言', key: 'item-2', children: this.languageView() },
			{ label: '多语言', key: 'item-2', children: <LanguageView projDir={workSpace} /> },
			{ label: '二维码', key: 'item-3', children: <QRCodeView /> },
		];
		return (
			<Tabs tabBarStyle={{ paddingLeft: 30, }} items={items} />
		);
	}

	// //Tab1 打包
	// packageView() {
	// 	const menu = (
	// 		<Menu
	// 			selectable
	// 			onClick={(e) => {
	// 				if (sysItems[e.key].label) {
	// 					this.setState({ selectedSys: sysItems[e.key].label })
	// 				}
	// 			}}
	// 			items={sysItems}
	// 		/>
	// 	);
	// 	const channel = (
	// 		<Menu
	// 			selectable
	// 			onClick={(e) => {
	// 				if (channelItems[e.key].label) {
	// 					this.setState({ selectedChannel: channelItems[e.key].label })
	// 				}
	// 			}}
	// 			items={channelItems}
	// 		/>
	// 	);
	// 	return (
	// 		<div style={{ paddingLeft: 30, paddingTop: 18, display: 'flex', flexDirection: 'column' }}>
	// 			<div style={{ display: 'flex', flexDirection: 'row' }}>
	// 				{this.renderItem('平台', this.renderPlatformSelect())}
	// 				{this.renderItem('环境', this.renderEnvSelect())}
	// 				{this.renderItem('类型', this.renderTypeSelect())}
	// 			</div>
	// 			<div style={{ display: 'flex', flexDirection: 'row' }}>
	// 				{this.renderItema('入口', this.renderFileSelect('entry'))}
	// 				<div style={{ width: '20px' }} ></div>
	// 				{this.state.type == 'buz' ? this.renderItem('版本', <Input disabled={!this.state.entry || (this.state.entry && this.state.entry.includes(',,'))} ref={ref => this.versionInput = ref} onChange={(e) => {
	// 					if (e.target.value) {
	// 						this.state.assetsDir = curBinDirName + '\\remotebundles'
	// 						this.state.bundleDir = curBinDirName + '\\remotebundles'
	// 					} else {
	// 						this.state.assetsDir = this.projPackageDir + path.sep + 'android\\app\\src\\main\\res'
	// 						this.state.bundleDir = this.projPackageDir + path.sep + 'android\\app\\src\\main\\assets'
	// 					}
	// 					this.setState({})
	// 					this.updateModuleIdConfig(e.target.value)
	// 				}} />) : null}

	// 			</div>
	// 			<div style={{ display: 'flex', flexDirection: 'row' }}>
	// 				{this.renderItem('bundle目录', this.renderFileSelect('bundle'))}
	// 				{this.renderItem('bundle名称(可不填)', this.renderBundleName())}
	// 			</div>
	// 			{this.renderItem('assets目录', this.renderFileSelect('assets'))}

	// 			<div style={{ display: 'flex', flexDirection: 'row' }}>
	// 				<Button style={{ marginTop: 12, marginLeft: 10, width: 100, color: '#555' }} onClick={() => {
	// 					let newDep = []
	// 					for (let dep of this.state.deps) {
	// 						if (typeof dep == 'string') {
	// 							newDep.push(dep)
	// 						}
	// 					}
	// 					if (this.state.type == 'buz') {
	// 						if ((this.state.depsChecked.length == 2 && this.state.depsChecked[0] == 'react' && this.state.depsChecked[1] == 'react-native')) {
	// 							this.state.depsChecked = []
	// 						}
	// 						if (!this.state.depsChecked || this.state.depsChecked.length == 0) {
	// 							if ((newDep.length == 2 && newDep[0] == 'react' && newDep[1] == 'react-native')) {
	// 								newDep = []
	// 							}
	// 							this.setState({ depsChecked: newDep })
	// 						}
	// 						else {
	// 							this.setState({ depsChecked: [] })
	// 						}
	// 					} else {
	// 						if (this.state.depsChecked && this.state.depsChecked.length == 2
	// 							&& this.state.depsChecked[0] == 'react' && this.state.depsChecked[1] == 'react-native') {
	// 							this.setState({ depsChecked: ['react', 'react-native', ...newDep] })
	// 						} else {
	// 							this.setState({ depsChecked: ['react', 'react-native'] })
	// 						}
	// 					}
	// 					// alert(JSON.stringify(this.state.defaultChecked, null, 2))
	// 					// this.setState({})
	// 				}}>全选</Button>
	// 				<Button style={{ marginTop: 12, marginLeft: 10, width: 100, color: '#555' }} onClick={() => {
	// 					alert(JSON.stringify(this.state.depsChecked, null, 2))
	// 				}}>查看选择</Button>
	// 				<Button style={{ marginTop: 12, marginLeft: 10, width: 120, color: '#555' }} onClick={() => {
	// 					remote.shell.openItem(this.state.bundleDir)
	// 				}}>跳转打包目录</Button>
	// 				{this.state.type == 'buz' ? <Button style={{ marginTop: 12, marginLeft: 10, width: 130, color: '#555' }} onClick={() => {
	// 					// remote.shell.openItem(curBinDirName + '\\remotebundles')
	// 					const packageDir = curBinDirName + '\\remotebundles\\'
	// 					fs.readdir(curBinDirName + '\\remotebundles\\drawable-mdpi', 'utf8', (e, files) => {
	// 						// alert(JSON.stringify(files, null, 2))
	// 						fs.readdir(curBinDirName + '\\android\\app\\src\\main\\res\\drawable-mdpi', 'utf8', (e, resFiles) => {
	// 							let zipRes = []
	// 							files.forEach((file) => {
	// 								if (resFiles.includes(file)) {
	// 									fs.unlinkSync(curBinDirName + '\\remotebundles\\drawable-mdpi\\' + file)
	// 								} else {
	// 									zipRes.push(file)
	// 								}
	// 							})
	// 							this.zipFolder(packageDir,
	// 								packageDir + (this.state.bundleName || (this.state.entry.substring(this.state.entry.lastIndexOf('index'), this.state.entry.indexOf('.js')) + `_V${this.versionInput.input.value || '0'}.android.bundle`)) + '.zip')
	// 							this.deleteDir(packageDir)
	// 						})
	// 					})
	// 				}}>生成插件更新包</Button> :
	// 					<Button style={{ marginTop: 12, marginLeft: 10, width: 120, color: '#555' }} onClick={() => {
	// 						this.cleanConfig()
	// 					}}>清空原来配置</Button>
	// 				}
	// 				<Button style={{ marginTop: 12, marginLeft: 10, width: 120, color: '#555' }} onClick={() => {
	// 					let json = fs.readFileSync(this.projPackageDir + path.sep + 'android\\app\\src\\main\\assets\\data\\menu.json', 'utf8')
	// 					if (confirm(JSON.stringify(JSON.parse(json), null, 2))) {
	// 						this.setState({ visible: true })
	// 					}
	// 				}}>查看模块详情</Button>
	// 			</div>
	// 			<div style={{ marginTop: '12px' }}>模块依赖:</div>
	// 			{this.renderItem(null, this.renderDep())}
	// 			<div style={{ marginTop: 12, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
	// 				<Button style={{ marginLeft: 10, marginRight: 10, width: 100, color: '#555' }} loading={this.state.loading} onClick={this.startPackage}>打包</Button>
	// 				<div style={{ color: this.state.entryErrorIndex ? 'red' : 'green' }}>{'打包总共' + this.entrys.length + '个：成功' + (this.entryIndex - this.state.entryErrorIndex) + '个，失败' + this.state.entryErrorIndex + '个' + (this.state.entryErrorIndex ? '，失败index-->' + JSON.stringify(this.state.entryErrorIndexs) : '')}</div>
	// 			</div>
	// 			<div style={{ flexDirection: 'row', display: 'flex', alignItems: 'center' }}>
	// 				<Button style={{ marginLeft: 10, marginRight: 10, marginTop: 10, width: 100, color: this.getPackageBtnText().color }} loading={this.state.loading} onClick={this.startAndroidPackage}>
	// 					{this.getPackageBtnText().name}
	// 				</Button>
	// 				<div style={{ flexDirection: 'row', alignItems: 'center', marginTop: '10px' }}>
	// 					<text style={{ color: '#555' }}>打包渠道：</text>
	// 					<Dropdown overlay={channel} trigger={['click']} selectable>
	// 						<Space>
	// 							{this.state.selectedChannel || '请选择渠道'}
	// 							<DownOutlined />
	// 						</Space>
	// 					</Dropdown>
	// 				</div>
	// 				<Button style={{ marginLeft: 10, marginRight: 10, marginTop: 10, width: 130, color: '#555' }} onClick={() => {
	// 					let androidPackageDir = '\\android\\app\\build\\outputs\\apk\\YT\\release'
	// 					if (this.state.selectedChannel == 'FWS') {
	// 						androidPackageDir = '\\android\\app\\build\\outputs\\apk\\FWS\\release'
	// 					}
	// 					if (!remote.shell.openItem(this.projDir + androidPackageDir)) {
	// 						message.info('目录文件不存在，请先打安装包！')
	// 					}
	// 				}}>跳转安装包目录</Button>
	// 				<Button style={{ marginLeft: 10, marginRight: 10, marginTop: 10, width: 100, color: '#555' }} onClick={() => {
	// 					message.info('正在上传，请稍候...')
	// 				}}>上传</Button>
	// 			</div>
	// 			<div>{this.state.cmd}</div>
	// 			<TextArea value={this.state.cmdStr} rows={10} readonly={true} style={{ marginTop: 12, width: 1200 }} />
	// 			<Modal
	// 				title="新增模块"
	// 				visible={this.state.visible}
	// 				onOk={this.handleOk.bind(this)}
	// 				onCancel={this.handleCancel.bind(this)}
	// 				footer={[
	// 					<Button key="back" onClick={this.handleCancel.bind(this)}>返回</Button>,
	// 					<Button key="submit" type="primary" onClick={this.handleOk.bind(this)}>创建</Button>
	// 				]}
	// 			>
	// 				<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
	// 					<text style={{ color: '#555' }}>模块名称：</text>
	// 					<Input style={{ flex: 1 }} onChange={(e) => {
	// 						if (e.target) {
	// 							this.state.modleName = e.target.value
	// 						}
	// 					}} />
	// 				</div>
	// 				<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: '10px' }}>
	// 					<text style={{ color: '#555' }}>模块权限：</text>
	// 					<Input style={{ flex: 1 }} onChange={(e) => {
	// 						if (e.target) {
	// 							this.state.modlePermission = e.target.value
	// 						}
	// 					}} />
	// 				</div>
	// 				<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: '10px' }}>
	// 					<text style={{ color: '#555' }}>模块系统：</text>
	// 					<Dropdown overlay={menu} trigger={['click']} selectable>
	// 						<Space>
	// 							{this.state.selectedSys || '请选择系统'}
	// 							<DownOutlined />
	// 						</Space>
	// 					</Dropdown>
	// 				</div>
	// 			</Modal >
	// 		</div >
	// 	)
	// }

	// //Tab2 多语言
	// languageView() {
	// 	return (
	// 		<div style={{ paddingLeft: 30, paddingRight: 30, paddingTop: 18, display: 'flex', flexDirection: 'column' }}>
	// 			<Input.TextArea onChange={(e) => {
	// 				this.state.i18nWordTextArea = e.target.value
	// 				this.setState({ i18nWordTextArea: e.target.value })
	// 			}} rows={15} value={this.state.i18nWordTextArea} />
	// 			<div style={{ marginTop: 10, display: 'flex', flexDirection: 'row' }}>
	// 				<Button style={{ width: 100 }} onClick={() => {
	// 					if (this.state.i18nWordTextArea) {
	// 						let objStr = this.state.i18nWordTextArea.replace(/(?:\s*['"]*)?([a-zA-Z0-9]+)(?:['"]*\s*)?:/g, "'$1':").replace('\n', '')
	// 						if (!objStr.startsWith('{')) {
	// 							objStr = '{' + objStr
	// 						}
	// 						if (!objStr.endsWith('}')) {
	// 							objStr = objStr + '}'
	// 						}
	// 						let obj = eval(`(${objStr})`)
	// 						let excel = ''
	// 						for (let k of Object.keys(obj)) {
	// 							if (typeof obj[k] == 'object') {
	// 								obj[k] = obj[k]['en']
	// 							}
	// 							excel += k + '\t' + obj[k] + '\r'
	// 						}
	// 						this.state.i18nWordTextArea = excel
	// 						this.setState({ i18nWordTextArea: excel })
	// 					}
	// 				}}>转换Excel</Button>
	// 				<Button style={{ width: 100, marginLeft: 10 }} onClick={() => {
	// 					if (this.state.i18nWordTextArea) {
	// 						let objStr = '{\n'
	// 						let objArray = []
	// 						const languages = ['zh', 'en', 'fr']
	// 						if (this.state.i18nWordTextArea.includes('\r')) {
	// 							objArray = this.state.i18nWordTextArea.split('\r')
	// 						} else {
	// 							objArray = this.state.i18nWordTextArea.split('\n')
	// 						}
	// 						for (let objItem of objArray) {
	// 							if (objItem) {
	// 								let kvs = objItem.split('\t')
	// 								if (kvs.length > 2) {
	// 									objStr += `${kvs[0]}: '${kvs[2]}',\n`
	// 								} else {
	// 									objStr += objItem.replace('\t', ": '") + "',\n"
	// 								}
	// 							}
	// 						}
	// 						objStr += '}'
	// 						this.setState({ i18nWordTextArea: objStr })
	// 					}
	// 				}}>转换Object</Button>
	// 				<Button style={{ width: 140, marginLeft: 10 }} onClick={() => {
	// 					if (this.state.i18nWordTextArea) {
	// 						let objStr = '{\n'
	// 						let objArray = []
	// 						const languages = ['zh', 'en', 'fr']
	// 						if (this.state.i18nWordTextArea.includes('\r')) {
	// 							objArray = this.state.i18nWordTextArea.split('\r')
	// 						} else {
	// 							objArray = this.state.i18nWordTextArea.split('\n')
	// 						}
	// 						let obj = {}
	// 						for (let objItem of objArray) {
	// 							if (objItem) {
	// 								let kvs = objItem.split('\t')
	// 								if (kvs.length > 2) {
	// 									obj[kvs[0]] = { zh: kvs[1], en: kvs[2] }
	// 									objStr = objStr + `\t${kvs[0]}: {\n\t\tzh: '${kvs[1]}',\n\t\ten: '${kvs[2]}'\n\t},\n`
	// 								} else {
	// 									obj[kvs[0]] = { en: kvs[1] }
	// 									this.setState({ i18nWordTextArea: JSON.stringify(obj, null, 2) })
	// 									return
	// 								}
	// 							}
	// 						}
	// 						objStr += '}'
	// 						this.setState({ i18nWordTextArea: objStr })
	// 						// this.setState({ i18nWordTextArea: JSON.stringify(obj, null, 2) })
	// 					}
	// 				}}>转换单文件Object</Button>
	// 				<Button style={{ width: 100, marginLeft: 10 }} onClick={() => {
	// 					if (this.state.i18nWordTextArea) {
	// 						let copyPath = this.projDir + '\\copy.txt'
	// 						fs.writeFileSync(copyPath, this.state.i18nWordTextArea, 'utf8')
	// 						let cmdStr = 'CHCP 65001 && clip < ' + copyPath
	// 						let packageProcess = exec(cmdStr, { cwd: this.projDir, encoding: 'buffer' }, (error, stdout, stderr) => {
	// 							if (error) {
	// 								this.state.packageStaus = -1
	// 								message.error('复制出错！')
	// 								console.error(`执行出错: ${iconv.decode(error.message, 'cp936')}`);
	// 								// return;
	// 							} else {
	// 								message.info('复制完成！')
	// 							}
	// 							console.log(`stdout: ${iconv.decode(stdout, 'CP936')}`);
	// 							console.log(`stderr: ${iconv.decode(stderr, 'CP936')}`);
	// 						});
	// 						packageProcess.stdout.on('data', (data) => {
	// 							console.log(`stdout: ${data}`);
	// 						});
	// 					}
	// 				}}>复制</Button>
	// 			</div>
	// 		</div>
	// 	)
	// }
}

module.exports = App;
