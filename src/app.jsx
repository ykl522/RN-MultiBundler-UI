const React = require('react');

const { Button, Checkbox, Input, Radio, Alert } = require('antd');
const CheckboxGroup = Checkbox.Group;
const { remote } = require("electron");

const path = require('path');
const JSZIP = require("jszip");
const fs = require("fs");
var _ = require('lodash');
const { TextArea } = Input;
const packageLockFileName = 'package-lock.json';
// const packageLockFileName = 'yarn.lock';
const packageFileName = 'package.json';
import { workSpace } from './config'
let curBinDirName = workSpace || __dirname;
// 排除部分文件或文件夹
//1 bin 2 0.58 0.59 3 demo
class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			platform: 'android',//平台 android iOS
			env: 'false',//环境 release debug
			entry: null,//打包入口
			type: 'base',//基础包 业务包
			bundleDir: null,//打包后bundle目录
			bundleName: null,//bundle名
			assetsDir: null,
			deps: [],//
			depsChecked: [],
			cmdStr: '',
			loading: false,
			defaultChecked: undefined
		};
		this.onDepCheckChange = this.onDepCheckChange.bind(this);
		this.selectFile = this.selectFile.bind(this);
		this.renderFileSelect = this.renderFileSelect.bind(this);
		this.renderItem = this.renderItem.bind(this);
		this.render = this.render.bind(this);
		this.renderPlatformSelect = this.renderPlatformSelect.bind(this);
		this.renderEnvSelect = this.renderEnvSelect.bind(this);
		this.fileSelected = this.fileSelected.bind(this);
		this.renderTypeSelect = this.renderTypeSelect.bind(this);
		this.renderBundleName = this.renderBundleName.bind(this);
		this.startPackage = this.startPackage.bind(this);
		this.initDir = this.initDir.bind(this);

		this.entrys = [];
		this.entryIndex = 0;
	}

	componentDidMount() {
		let openType = 'openDirectory';
		let filter = undefined;
		let title = '清选择RN工程目录';
		// setTimeout(() => {
		// 	this.initDir(curBinDirName)
		// }, 2000)
		remote.dialog.showOpenDialog(
			remote.getCurrentWindow(),
			{
				defaultPath: curBinDirName,
				title: title,
				buttonLabel: '选择',
				filters: filter,
				properties: [openType]
			},
			(filePath) => {
				if (filePath) {
					const directory = filePath[0];
					this.initDir(directory);
				}
			}
		)
	}

	initDir(curDir) {
		//load lock.json
		//const curDir = curBinDirName;
		console.log('curDir', path.dirname(curDir));
		let dirTmp = curDir;
		while (dirTmp.length > 2) {
			console.log('curDir', dirTmp);
			let packageLockFile = path.join(dirTmp, packageLockFileName);
			let packageJsonFile = path.join(dirTmp, packageFileName);
			if (fs.existsSync(packageLockFile)) {
				console.log('package-lock.json', packageLockFile);
				this.projDir = dirTmp;//要分包的项目目录
				this.projPackageDir = dirTmp;
				this.packageFilePath = packageJsonFile;//packageJson
				this.packageFileLockPath = packageLockFile;
				break;
			}
			dirTmp = path.dirname(dirTmp);
		}
		console.log('projDir', this.projDir);
		if (this.packageFilePath != null) {
			this.state.assetsDir = this.projPackageDir + path.sep + 'android\\app\\src\\main\\res'
			this.state.bundleDir = this.projPackageDir + path.sep + 'android\\app\\src\\main\\assets'
			this.setState({ entry: this.projPackageDir + path.sep + 'platformDep-ui.js' });
			fs.readFile(this.packageFilePath, 'utf8', (err, fileContent) => {
				if (err) {
					if (err.code === 'ENOENT') {
						return
					}
					throw new Error(err)
				}

				const content = JSON.parse(fileContent);
				let deps = content['dependencies'];
				this.depsStrs = Object.keys(deps);
				let depsArray = Object.keys(deps);
				// this.state.defaultChecked = Object.keys(deps)
				for (let i = 0; i < depsArray.length; i++) {
					let depStr = depsArray[i];
					if (depStr == 'react' || depStr == 'react-native') {
						depsArray[i] = { value: depStr, label: depStr, check: true, disabled: true };
					}
				}
				this.setState({ deps: depsArray });
				console.log('package json content', content);
			});
		} else {
			alert('请在先在目标工程执行npm install再进入程序，或者选择正确的工程目录');
		}
		const fixPath = require('fix-path');
		fixPath();
	}

	renderItem(name, item) {
		return (<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: '12px' }}>
			<div style={{ marginRight: '10px' }}>{name + ' :  '}</div>
			<div style={{ display: 'flex', flexDirection: 'row' }}>{item}</div>
		</div>)
	}

	renderItema(name, item) {
		return (<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: '12px' }}>
			<div style={{ marginRight: '10px' }}>{name + ' :  '}</div>
			<div style={{ display: 'flex', flexDirection: 'row', maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item}</div>
		</div>)
	}

	renderPlatformSelect() {
		return (<Radio.Group defaultValue="android" buttonStyle="solid"
			onChange={(e) => {
				console.log('renderPlatformSelect---> ' + e.target.value);
				this.state.platform = e.target.value
				this.setState({ platform: e.target.value });
			}}>
			<Radio.Button value="android">Android</Radio.Button>
			<Radio.Button value="ios">iOS</Radio.Button>
		</Radio.Group>);
	}
	renderEnvSelect() {
		return (<Radio.Group defaultValue="false" buttonStyle="solid"
			onChange={(e) => {
				console.log('renderEnvSelect', e);
				this.setState({ env: e.target.value });
			}}>
			<Radio.Button value="false">Release</Radio.Button>
			<Radio.Button value="true">Debug</Radio.Button>
		</Radio.Group>);
	}
	renderTypeSelect() {
		return (<Radio.Group defaultValue="base" buttonStyle="solid"
			onChange={(e) => {
				console.log('renderEnvSelect-->' + JSON.stringify(e));
				try {
					if (e && e.target)
						this.state.type = e.target.value
					if (e && e.target && e.target.value == 'base') {
						let temp = 0
						for (let dep of this.state.depsChecked) {
							if (dep == 'react' || dep == 'react-native') {
								temp++
							}
						}
						if (temp != 2) {
							this.state.depsChecked = ['react', 'react-native']
						}
						this.setState({ entry: this.projPackageDir + path.sep + 'platformDep-ui.js' });
					} else {
						this.setState({ entry: '' });
						for (let i = 0; i < this.state.depsChecked.length; i++) {
							let dep = this.state.depsChecked[i]
							if (dep == 'react' || dep == 'react-native') {
								this.state.depsChecked.splice(i--, 1);
							}
						}
					}
					// this.setState({ type: e.target.value });
					// if (e.target.value == 'base') {
					//   this.setState({ entry: this.projPackageDir + path.sep + 'platformDep-ui.js' });
					// } else {
					//   this.setState({ entry: '' });
					// }
				} catch (e) {
					alert(e)
				}
			}}
		>
			<Radio.Button value="base">基础包</Radio.Button>
			<Radio.Button value="buz">业务包</Radio.Button>
		</Radio.Group>);
	}
	renderFileSelect(id) {
		let buttonName = '选择目录';
		if (id == 'entry') {//file
			buttonName = '选择文件';
			if (this.state.entry) {
				buttonName = this.state.entry;
			}
		} else if (id == 'bundle') {
			if (this.state.bundleDir) {
				buttonName = this.state.bundleDir;
			}
		} else if (id == 'assets') {
			if (this.state.assetsDir) {
				buttonName = this.state.assetsDir;
			}
		}
		return (<Button onClick={_ => this.selectFile(id)} block>{buttonName}</Button>);
	}

	fileSelected(id, path) {
		if (id == 'entry') {//file
			this.setState({ entry: path });
		} else if (id == 'bundle') {
			this.setState({ bundleDir: path });
		} else if (id == 'assets') {
			this.setState({ assetsDir: path });
		}
	}

	selectFile(id) {
		let openType = 'openDirectory';
		let title = '选择';
		let filter = undefined;
		if (id == 'entry') {
			// openType = 'openFile';

			openType = 'multiSelections';


			title = '打包入口文件选择';
			filter = [
				{
					extensions: ['js']
				}
			]
		} else if (id == 'bundle') {
			title = '打包bundle目录选择';
		} else if (id == 'assets') {
			title = '打包资源目录选择';
		}
		console.log('projDir', this.projDir);
		remote.dialog.showOpenDialog(
			remote.getCurrentWindow(),
			{
				defaultPath: this.projDir + (id == 'entry' ? '\\indexs' : ''),
				title: title,
				buttonLabel: '选择',
				filters: filter,
				properties: [openType]
			},
			(filePath) => {
				if (filePath) {

					let directory = filePath[0];
					if (id == 'entry') {
						directory = filePath.join(",,");
					}

					// for (let index = 0; index < filePath.length; index++) {
					// 	const element = filePath[index];
					// 	console.log("================" + element + "+++++++");

					// }


					this.fileSelected(id, directory);
				}
			}
		)
	}

	renderBundleName() {
		return (<Input ref={(componentInput) => { this.bundleNameInput = componentInput }} />);
	}

	onDepCheckChange(e) {
		const { type } = this.state;
		if (type == 'buz') {
			e = e.filter((value) => !(value == 'react' || value == 'react-native'));
		}
		console.log(JSON.stringify(e));
		this.setState({ depsChecked: e });
	}

	renderDep1() {
		const { deps, depsChecked, type } = this.state;
		let options = deps;
		let defaultChecked = ['react', 'react-native'];
		if (type == 'buz') {//业务包不可能把react打进去
			options = options.filter((value) => !(value == 'react' || value == 'react-native'
				|| value.value == 'react' || value.value == 'react-native'));
			defaultChecked = undefined;
		}
		return <CheckboxGroup options={options} onChange={this.onDepCheckChange} defaultValue={defaultChecked} />
	}

	renderDep() {
		const { deps, type } = this.state;
		let options = [...deps];
		if (type != 'buz' && (!this.state.depsChecked || this.state.depsChecked.length == 0)) {
			this.state.depsChecked = ['react', 'react-native'];
			console.log('---' + this.state.depsChecked)
		}
		// this.state.depsChecked.push('moment')
		if (type == 'buz') {//业务包不可能把react打进去
			options = options.filter((value) => !(value == 'react' || value == 'react-native'
				|| value.value == 'react' || value.value == 'react-native'));
		}
		// alert(JSON.stringify(this.state.defaultChecked, null, 2))
		return <CheckboxGroup
			options={options}
			onChange={this.onDepCheckChange}
			value={this.state.depsChecked}
		/>

	}

	getAllDeps(platformDepArray, lockDeps) {
		let allPlatformDep = [];
		let travelStack = [...platformDepArray];
		while (travelStack.length != 0) {
			let depItem = travelStack.pop();
			allPlatformDep.push(depItem);
			console.log('depItem==> ' + depItem);
			let depDetail = lockDeps[depItem];
			if (depDetail == null) {
				console.log('depItem no found', depItem);
				continue;
			}
			let depReq = depDetail['requires'];
			if (depReq != null) {
				travelStack = travelStack.concat(_.difference(Object.keys(depReq), allPlatformDep));//difference防止循环依赖
			}
		}
		console.log('allPlatformDep: ' + JSON.stringify(allPlatformDep));
		return _.uniq(allPlatformDep);
	}


	startPackage() {
		const { entry } = this.state;
		if (entry == null) {
			alert("请选择打包的js入口");
			return;
		}
		this.entrys = entry.split(",,");
		this.entryIndex = 0;
		if (this.entrys.length > 0) {
			this.loopPackage();
		}

	}

	loopPackage() {
		if (this.entryIndex >= this.entrys.length) {
			return;
		}

		const entry = this.entrys[this.entryIndex];

		console.log("*************** package  run  no ** " + (this.entryIndex + 1) + " pkg: " + entry);

		this.setState({ cmdStr: '' });
		const { exec } = require('child_process');
		const { platform, env, type, bundleDir, assetsDir, depsChecked } = this.state;
		console.log("-----getModuleVersion----" + this.getModuleVersion(entry))
		let bundleName = this.bundleNameInput.state.value || (type == 'buz' ?
			(entry.substring(entry.lastIndexOf('index'), entry.indexOf('.js')) + `_V${this.versionInput.state.value || this.getModuleVersion(entry) || '0'}.android.bundle`)
			: 'platform.android.bundle');
		this.state.bundleName = bundleName
		// console.log('bundleName', bundleName
		//   , 'platform', platform, 'env', env, 'entry', entry, 'type', type, 'bundleDir', bundleDir, 'assetsDir', assetsDir
		//   , 'depsChecked', depsChecked);
		if (entry == null) {
			alert("请选择打包的js入口");
			return;
		}
		if (bundleDir == null) {
			alert("请选择jsbundle的目标目录");
			return;
		}
		if (bundleName == null) {
			alert("请选择jsbundle的文件名称");
			return;
		}
		if (assetsDir == null) {
			alert("请选择资源文件的目标目录");
			return
		}
		let bundleConifgName;
		let platformDepJsonPath = this.projPackageDir + path.sep + 'platformDep.json';
		if (type == 'base') {
			bundleConifgName = 'platform-ui.config.js';
			fs.writeFileSync(platformDepJsonPath, JSON.stringify(depsChecked));
			let platformDepImportPath = this.projPackageDir + path.sep + 'platformDep-import.js';
			let importStr = '';
			depsChecked.forEach((moduleStr) => {
				importStr = importStr + 'import \'' + moduleStr + '\'\n';
			});
			fs.writeFileSync(platformDepImportPath, importStr);
		} else {
			bundleConifgName = 'buz-ui.config.js';
			const platformDepArray = require(platformDepJsonPath);
			if (!Array.isArray(platformDepArray)) {
				alert("必须先打基础包");
				return;//必须先打基础包
			}
			if (depsChecked.length > 0) {//需要过滤platformDepArray
				const packageLockObj = require(this.packageFileLockPath);
				const lockDeps = packageLockObj['dependencies'];
				console.log('start deal platform dep');
				let allPlatformDep = this.getAllDeps(platformDepArray, lockDeps);
				console.log('start deal buz dep');
				let allBuzDep = this.getAllDeps(depsChecked, lockDeps);
				let filteredBuzDep = _.difference(allBuzDep, allPlatformDep);
				let buzDepJsonPath = this.projPackageDir + path.sep + 'buzDep.json';//业务包依赖的路径
				fs.writeFileSync(buzDepJsonPath, JSON.stringify(filteredBuzDep));//todo 打包脚本读取该数组
			}
		}
		let cmdStr = 'node ./node_modules/react-native/local-cli/cli.js bundle  --platform ' + platform
			+ ' --dev ' + env + ' --entry-file ' + entry + ' --bundle-output ' + bundleDir + path.sep + bundleName
			+ ' --assets-dest ' + assetsDir + ' --config ' + this.projPackageDir + path.sep + bundleConifgName;
		this.setState({ loading: true });
		this.state.cmd = cmdStr
		// alert(cmdStr)
		let packageProcess = exec(cmdStr, { cwd: this.projDir }, (error, stdout, stderr) => {
			this.setState({ loading: false });
			if (error) {
				console.error(`执行出错: ${error}`);
				this.setState({ cmdStr: error });
				return;
			}
			console.log(`stdout: ${stdout}`);
			console.log(`stderr: ${stderr}`);
			this.entryIndex++;
			this.loopPackage();
		});
		packageProcess.stdout.on('data', (data) => {
			console.log(`stdout: ${data}`);
			let cmdRetStrs = data + this.state.cmdStr;
			this.setState({ cmdStr: cmdRetStrs });
		});

	}

	// zip 递归读取文件夹下的文件流
	readDir(zip, nowPath) {
		// 读取目录中的所有文件及文件夹（同步操作）
		console.log('----------read-----------')
		let files = fs.readdirSync(nowPath)
		//遍历检测目录中的文件
		files.filter(name => !name.includes('.zip')).forEach((fileName, index) => {
			// 打印当前读取的文件名
			console.log(fileName, index)
			// 当前文件的全路径
			let fillPath = path.join(nowPath, fileName)
			// 获取一个文件的属性
			let file = fs.statSync(fillPath)
			// 如果是目录的话，继续查询
			if (file.isDirectory()) {
				// 压缩对象中生成该目录
				let dirlist = zip.folder(fileName)
				// （递归）重新检索目录文件
				this.readDir(dirlist, fillPath)
			} else {
				// 压缩目录添加文件
				zip.file(fileName, fs.readFileSync(fillPath))
			}
		})
		console.log('+---------read----------+')
	}

	deleteDir(nowPath) {
		// 读取目录中的所有文件及文件夹（同步操作）
		let files = fs.readdirSync(nowPath)
		//遍历检测目录中的文件
		console.log('----------delete-----------')
		files.filter(name => !name.includes('.zip')).forEach((fileName, index) => {
			// 打印当前读取的文件名
			// 当前文件的全路径
			let fillPath = path.join(nowPath, fileName)
			// 获取一个文件的属性
			let file = fs.statSync(fillPath)
			// 如果是目录的话，继续查询
			if (file.isDirectory()) {
				// （递归）重新检索目录文件
				this.deleteDir(fillPath)
				fs.rmdirSync(fillPath)
				console.log(fileName)
			} else {
				// 压缩目录添加文件
				fs.unlinkSync(fillPath)
				console.log(index + "---" + fileName)
			}
		})
		console.log('+---------delete----------+')
	}

	// 开始压缩文件
	zipFolder(target = __dirname, output = __dirname + '/result.zip') {
		// 创建 zip 实例
		const zip = new JSZIP()
		// zip 递归读取文件夹下的文件流
		this.readDir(zip, target)
		// 设置压缩格式，开始打包
		zip.generateAsync({
			// nodejs 专用
			type: 'nodebuffer',
			// 压缩算法
			compression: 'DEFLATE',
			// 压缩级别
			compressionOptions: { level: 9, },
		}).then(content => {
			// 将打包的内容写入 当前目录下的 result.zip中
			fs.writeFileSync(output, content, 'utf-8')

		}).catch(e => {
			alert(e)
		})
	}

	formatZero(num, len) {
		if (String(num).length > len) return num;
		return (Array(len).join(0) + num).slice(-len);
	}

	//更新Map版本号
	updateModuleIdConfig(inputValue) {
		if (!inputValue) inputValue = '0'
		//只取两位
		if (inputValue && inputValue.length > 2) inputValue = inputValue.substring(0, 2)
		let configPath = curBinDirName + path.sep + 'multibundler' + path.sep + 'ModuleIdConfig.json'
		let json = fs.readFileSync(configPath, 'utf8')
		let config = JSON.parse(json)
		let selectFileName = this.state.entry + ''
		const id = selectFileName.substring(selectFileName.lastIndexOf('index') + 5, selectFileName.indexOf('.js'))
		config[selectFileName.substring(selectFileName.lastIndexOf('\\') + 1)] = Number(id + this.formatZero(inputValue, 2) + '000')
		let newJson = JSON.stringify(config, null, 2)
		// alert(newJson)
		fs.writeFileSync(configPath, newJson, 'utf8')
		fs.unlinkSync(curBinDirName + path.sep + 'multibundler' + path.sep + 'index' + id + 'Map.json')
	}

	//获取Map里面版本号
	getModuleVersion(selectFileName) {
		let configPath = curBinDirName + path.sep + 'multibundler' + path.sep + 'ModuleIdConfig.json'
		let json = fs.readFileSync(configPath, 'utf8')
		let config = JSON.parse(json)
		const moduleInfo = config[selectFileName.substring(selectFileName.lastIndexOf('\\') + 1)] + ""
		console.log("moduleInfo--->" + moduleInfo)
		return Number(moduleInfo.substring(moduleInfo.length - 5, moduleInfo.length - 3)) + ""
	}

	render() {
		return (<div style={{ paddingLeft: 30, paddingTop: 18, display: 'flex', flexDirection: 'column' }}>
			{this.renderItem('平台', this.renderPlatformSelect())}
			{this.renderItem('环境', this.renderEnvSelect())}
			{this.renderItem('类型', this.renderTypeSelect())}
			<div style={{ display: 'flex', flexDirection: 'row' }}>
				{this.renderItema('入口', this.renderFileSelect('entry'))}
				<div style={{ width: '20px' }} ></div>
				{this.state.type == 'buz' ? this.renderItem('版本', <Input disabled={!this.state.entry || (this.state.entry && this.state.entry.includes(',,'))} ref={ref => this.versionInput = ref} onChange={(e) => {
					if (e.target.value) {
						this.state.assetsDir = curBinDirName + '\\remotebundles'
						this.state.bundleDir = curBinDirName + '\\remotebundles'
					} else {
						this.state.assetsDir = this.projPackageDir + path.sep + 'android\\app\\src\\main\\res'
						this.state.bundleDir = this.projPackageDir + path.sep + 'android\\app\\src\\main\\assets'
					}
					this.setState({})
					this.updateModuleIdConfig(e.target.value)
				}} />) : null}

			</div>
			{this.renderItem('bundle目录', this.renderFileSelect('bundle'))}
			{this.renderItem('bundle名称(可不填)', this.renderBundleName())}
			{this.renderItem('assets目录', this.renderFileSelect('assets'))}

			<div style={{ display: 'flex', flexDirection: 'row' }}>
				<Button style={{ marginTop: 12, marginLeft: 10, width: 100 }} onClick={() => {
					let newDep = []
					for (let dep of this.state.deps) {
						if (typeof dep == 'string') {
							newDep.push(dep)
						}
					}
					if (this.state.type == 'buz') {
						if ((this.state.depsChecked.length == 2 && this.state.depsChecked[0] == 'react' && this.state.depsChecked[1] == 'react-native')) {
							this.state.depsChecked = []
						}
						if (!this.state.depsChecked || this.state.depsChecked.length == 0) {
							if ((newDep.length == 2 && newDep[0] == 'react' && newDep[1] == 'react-native')) {
								newDep = []
							}
							this.setState({ depsChecked: newDep })
						}
						else {
							this.setState({ depsChecked: [] })
						}
					} else {
						if (this.state.depsChecked && this.state.depsChecked.length == 2
							&& this.state.depsChecked[0] == 'react' && this.state.depsChecked[1] == 'react-native') {
							this.setState({ depsChecked: ['react', 'react-native', ...newDep] })
						} else {
							this.setState({ depsChecked: ['react', 'react-native'] })
						}
					}
					// alert(JSON.stringify(this.state.defaultChecked, null, 2))
					// this.setState({})
				}}>全选</Button>
				<Button style={{ marginTop: 12, marginLeft: 10, width: 100 }} onClick={() => {
					alert(JSON.stringify(this.state.depsChecked, null, 2))
				}}>查看选择</Button>
				<Button style={{ marginTop: 12, marginLeft: 10, width: 120 }} onClick={() => {
					remote.shell.openItem(this.state.bundleDir)
				}}>跳转打包目录</Button>
				{this.state.type == 'buz' ? <Button style={{ marginTop: 12, marginLeft: 10, width: 130 }} onClick={() => {
					// remote.shell.openItem(curBinDirName + '\\remotebundles')
					const packageDir = curBinDirName + '\\remotebundles\\'
					fs.readdir(curBinDirName + '\\remotebundles\\drawable-mdpi', 'utf8', (e, files) => {
						// alert(JSON.stringify(files, null, 2))
						fs.readdir(curBinDirName + '\\android\\app\\src\\main\\res\\drawable-mdpi', 'utf8', (e, resFiles) => {
							let zipRes = []
							files.forEach((file) => {
								if (resFiles.includes(file)) {
									fs.unlinkSync(curBinDirName + '\\remotebundles\\drawable-mdpi\\' + file)
								} else {
									zipRes.push(file)
								}
							})
							this.zipFolder(packageDir,
								packageDir + (this.state.bundleName || (this.state.entry.substring(this.state.entry.lastIndexOf('index'), this.state.entry.indexOf('.js')) + `_V${this.versionInput.state.value || '0'}.android.bundle`)) + '.zip')
							this.deleteDir(packageDir)
						})
					})
				}}>生成业务更新包</Button> : null}
			</div>
			{this.renderItem('模块依赖', this.renderDep())}
			<Button style={{ marginTop: 12, marginLeft: 10, width: 100 }} loading={this.state.loading} onClick={this.startPackage}>打包</Button>
			<div>{this.state.cmd}</div>
			<TextArea value={this.state.cmdStr} rows={4} readonly={true} style={{ marginTop: 12, width: 600 }} />
		</div>);
	}
}

module.exports = App;
