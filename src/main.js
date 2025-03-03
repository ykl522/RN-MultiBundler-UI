/*
 * @Author: 袁康乐 yuankangle@gmail.com
 * @Date: 2022-09-23 16:21:57
 * @LastEditors: 康乐 yuankangle@gmail.com
 * @LastEditTime: 2023-03-21 16:03:51
 * @FilePath: \RN-MultiBundler-UI\src\main.js
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