/**
 * @author: @AngularClass
 */

const helpers = require('./helpers');
// used to merge webpack configs
const webpackMerge = require('webpack-merge');
// const webpackMergeDll = webpackMerge.strategy({plugins: 'replace'});
// the settings that are common to prod and dev
const commonConfig = require('./webpack.common.js');
const webpack = require("webpack");

/**
 * Webpack Plugins
 */
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
// const NamedModulesPlugin = require('webpack/lib/NamedModulesPlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require("path");

// const MiniCssExtractPlugin = require("mini-css-extract-plugin");

/**
 * Webpack Constants
 */
const ENV = process.env.ENV = process.env.NODE_ENV = 'development';
const HOST = process.env.HOST || '0.0.0.0'
// DEV
//const TARGETURL = 'https://mxgestaclar-gateway-mxgestaclar-dev.appls.mex01.mex.dev.mx1.paas.cloudcenter.corp/';
//const TARGETPARAM = 'oauth/token?client_id=cd575250-cc36-426f-ac18-0939253387ee';
// PRE
//const TARGETURL = 'https://mxgestaclar-gateway-mxgestaclar-pre.appls.cto2.paas.gsnetcloud.corp/'; //version de la vieja arquitectura 
const TARGETURL = 'https://gestionaclaraciones.pre.mx.corp/';
const TARGETPARAM = 'oauth/token?client_id=2dd0eea4-a219-49b0-8e91-08536ab017f4';
const PORT = process.env.PORT || 3000;
const HMR = helpers.hasProcessFlag('hot');
const METADATA = webpackMerge(commonConfig({env: ENV}).metadata, {
  host: HOST,
  port: PORT,
  ENV: ENV,
  HMR: HMR
});

/**
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = function () {
  return webpackMerge(commonConfig({env: ENV}), {
    devtool: 'cheap-module-source-map',
    output: {
      path: helpers.root('dist'),
      filename: '[name].bundle.js',
      sourceMapFilename: '[file].map',
      chunkFilename: '[id].chunk.js',
      library: 'ac_[name]',
      libraryTarget: 'var'
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
          include: [helpers.root('src', 'app/styles')]
        },
        {
          test: /\.scss$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
          include: [helpers.root('src', 'app/styles')]
        }
        // {
        //   test: /\.scss$/,
        //   use: [MiniCssExtractPlugin.loader, "css-loader" , "sass-loader"],
        //   /*loader: ExtractTextPlugin.extract({
        //     fallback: 'style-loader',
        //     use: ['css-loader','sass-loader']
        //   }),*/
        //   include: [helpers.root('src', 'app/styles')],
        // }
      ]
    },
    plugins: [
      new DefinePlugin({
        'ENV': JSON.stringify(METADATA.ENV),
        'HMR': METADATA.HMR,
        'process.env': {
          'ENV': JSON.stringify(METADATA.ENV),
          'NODE_ENV': JSON.stringify(METADATA.ENV),
          'HMR': METADATA.HMR
        }
      }),
      new CopyWebpackPlugin([
        { from: 'config/nginx-config-dev.json', to: 'config.json' },
        { from: 'dummy/data/', to: 'assets/data/' },
        { from: 'config/health.json', to: 'health.json' }
      ]),
      new LoaderOptionsPlugin({
        debug: true,
        options: {
        }
      }),
      new webpack.HotModuleReplacementPlugin()
      // new MiniCssExtractPlugin(),
    ],
    devServer: {
      static: path.resolve(__dirname, 'src'),
      port: METADATA.port,
      host: METADATA.host,
      historyApiFallback: true,
      hot: true,
      proxy: {
        '/token': {
          target: `${TARGETURL}${TARGETPARAM}`,
          secure: false,
          ignorePath: true,
          changeOrigin: true,
          logLevel: 'debug'
        }
      }
    },
    node: {
      global: true,
      __filename: true,
      __dirname: true
    }
  });
};
