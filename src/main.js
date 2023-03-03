/*
 * @Author: 袁康乐 yuankangle@yunexpress.cn
 * @Date: 2022-09-23 16:21:57
 * @LastEditors: 康乐 yuankangle@yunexpress.cn
 * @LastEditTime: 2023-02-27 17:27:04
 * @FilePath: \RN-MultiBundler-UI\src\main.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const React = require('react');
const ReactDOM = require('react-dom');
const { AppContainer } = require('react-hot-loader');

const render = () => {
    const App = require('./app');
    ReactDOM.render(<AppContainer><App /></AppContainer>, document.getElementById('App'));
    require('antd');
}

render();
if (module.hot) {
    module.hot.accept(render);
}