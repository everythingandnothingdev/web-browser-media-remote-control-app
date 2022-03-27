const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    publicPath: './',
    outputDir: path.resolve(__dirname, './www'),
    transpileDependencies: [' vuetify '],
    configureWebpack: (config) => {
        const copyPluginConfig = [
            {
                from: 'src/assets',
                to: './assets',
                ignore: ['.DS_Store']
            }
        ];
        config.plugins.push(new CopyWebpackPlugin(copyPluginConfig));
    }
};
