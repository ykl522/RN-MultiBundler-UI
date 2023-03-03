/**
 * @Author: 康乐 yuankangle@yunexpress.cn
 * @Date: 2022-11-03 14:37:26
 * @LastEditors: 康乐 yuankangle@yunexpress.cn
 * @LastEditTime: 2023-03-02 15:29:27
 * @FilePath: \ops_pdad:\Git\RN-MultiBundler-UI\webpack.config.js
 * @Description: 
 * @
 * @Copyright (c) 2023 by 康乐 yuankangle@yunexpress.cn, All Rights Reserved. 
 */
module.exports = {
    module: { //所有第三方模块的配置规则，只要webpack处理不了的，都会来这里找
        rules: [
            { test: /\.(js|jsx|ts|tsx)$/, use: 'babel-loader', exclude: /node_modules/ },
        ],
        loaders: [
            {
                test: /\.(js|jsx|ts|tsx)$/,
                loader: 'babel',
                exclude: /node_modules/
            }
        ]
    }
}