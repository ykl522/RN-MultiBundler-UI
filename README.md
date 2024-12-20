# RN-MultiBundler-UI

可视化的 RN 拆包工具

专门为 react-native-multibundler 开发的 UI 拆包工具，使用 electron 开发

使用方法：

1、安装 electron

2、进入工程目录，yarn install

3、运行程序，执行 yarn start

4、刚进入会弹出选择需要拆包的工程目录的弹框：

<img src="https://github.com/smallnew/RN-MultiBundler-UI/raw/master/readme/choose_proj_dialog.jpg" width="600" alt="choose_proj_dialog"></img>

5、根据需要选择打包参数：

<img src="https://github.com/smallnew/RN-MultiBundler-UI/raw/master/readme/packege_ui.jpg" width="600" alt="packege_ui"></img>

该拆包工具跟命令行打包最大的优势是：当业务包依赖一个大型的第三方库的时候，这个第三方库又依赖的其他的第三方库，UI 打包工具能自动计算出所有需要打包进入的第三方库
