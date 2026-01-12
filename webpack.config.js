module.exports = {
    packagerConfig: {
        // 仅打包必要的文件
        ignore: /(^\/(src|resources)$|\.git)/,
    },
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {},
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin'],
        },
        {
            name: '@electron-forge/maker-deb',
            config: {},
        },
        {
            name: '@electron-forge/maker-rpm',
            config: {},
        },
    ],
    webpackConfig: {
        // 优化Webpack配置，例如使用缓存等
        mode: 'production',
        optimization: {
            splitChunks: {
                chunks: 'all',
            },
        },
    },
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