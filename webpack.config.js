module.exports = {
    module: { //所有第三方模块的配置规则，只要webpack处理不了的，都会来这里找
        rules: [
            { test: /\.(js|jsx)$/, use: 'babel-loader', exclude: /node_modules/ },
        ]
    }
}