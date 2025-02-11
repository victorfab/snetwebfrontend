/**
 * @author: @AngularClass
 */

 const webpack = require('webpack');
 const helpers = require('./helpers');
 
 /**
  * Webpack Plugins
  *
  * problem with copy-webpack-plugin
  */
 
 //const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
 const CopyWebpackPlugin = require('copy-webpack-plugin');
// const { CheckerPlugin } = require('awesome-typescript-loader');
 const HtmlWebpackPlugin = require('html-webpack-plugin');
 //const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
 //const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
 //const ngcWebpack = require('ngc-webpack');
 //const PreloadWebpackPlugin = require('preload-webpack-plugin');
 
 /**
  * Webpack Constants
  */
 const HMR = helpers.hasProcessFlag('hot');
 const AOT = process.env.BUILD_AOT || helpers.hasNpmFlag('aot');
 const METADATA = {
   title: 'Santander :: Customer Service',
   baseUrl: '/',
   isDevServer: helpers.isWebpackDevServer(),
   HMR: HMR
 };
 
 /**
  * Webpack configuration
  *
  * See: http://webpack.github.io/docs/configuration.html#cli
  */
 module.exports = function (options) {
   const isProd = options.env === 'production';
   return {
 
     /**
      * Cache generated modules and chunks to improve performance for multiple incremental builds.
      * This is enabled by default in watch mode.
      * You can pass false to disable it.
      *
      * See: http://webpack.github.io/docs/configuration.html#cache
      */
     //cache: false,
 
     /**
      * The entry point for the bundle
      * Our Angular.js app
      *
      * See: http://webpack.github.io/docs/configuration.html#entry
      */
     entry: {
 
       ...isProd && {'polyfills': './src/polyfills.browser.ts'},
       'main':      AOT ? './src/main.browser.aot.ts' :
                   './src/main.browser.ts'
 
     },
 
     /**
      * Options affecting the resolving of modules.
      *
      * See: http://webpack.github.io/docs/configuration.html#resolve
      */
     resolve: {
 
       /**
        * An array of extensions that should be used to resolve modules.
        *
        * See: http://webpack.github.io/docs/configuration.html#resolve-extensions
        */
       extensions: ['.ts', '.js', '.json'],
 
       /**
        * An array of directory names to be resolved to the current directory
        */
       modules: [helpers.root('src'), helpers.root('node_modules')]
 
     },
 
     /**
      * Options affecting the normal modules.
      *
      * See: http://webpack.github.io/docs/configuration.html#module
      */
     module: {
 
       rules: [
         /**
          * Typescript loader support for .ts
          *
          * Component Template/Style integration using `angular2-template-loader`
          * Angular 2 lazy loading (async routes) via `ng-router-loader`
          *
          * `ng-router-loader` expects vanilla JavaScript code, not TypeScript code. This is why the
          * order of the loader matter.
          *
          * See: https://github.com/s-panferov/awesome-typescript-loader
          * See: https://github.com/TheLarkInn/angular2-template-loader
          * See: https://github.com/shlomiassaf/ng-router-loader
          */
         {
           test: /\.ts$/,
           use: [
             {
               loader: '@angularclass/hmr-loader',
               options: {
                 pretty: !isProd,
                 prod: isProd
               }
             },
             {
               /**
                *  MAKE SURE TO CHAIN VANILLA JS CODE, I.E. TS COMPILATION OUTPUT.
                */
               loader: 'ng-router-loader',
               options: {
                 loader: 'async-import',
                 genDir: 'compiled',
                 aot: AOT
               }
             },
             {
               loader: 'ts-loader',
               options: {
                configFile: 'tsconfig.webpack.json',
                compilerOptions: {
                  noEmit: false,
                },
                 //useCache: !isProd
               }
             },
             {
               loader: 'angular2-template-loader'
             }
           ],
           exclude: [/\.(spec|e2e)\.ts$/]
         },
 
         /**
          * Json loader support for *.json files.
          *
          * See: https://github.com/webpack/json-loader
          */
         /*{
           test: /\.json$/,
           use: 'json-loader'
         },*/
 
         /**
          * To string and css loader support for *.css files (from Angular components)
          * Returns file content as string
          *
          */
         {
           test: /\.css$/,
           use: ['to-string-loader', 'css-loader'],
           exclude: [helpers.root('src', 'app/styles')]
         },
 
         /**
          * To string and sass loader support for *.scss files (from Angular components)
          * Returns compiled css content as string
          *
          */
         {
           test: /\.scss$/,
           use: ['to-string-loader', 'css-loader', 'sass-loader'],
           exclude: [helpers.root('src', 'app/styles')]
         },
 
         /**
          * Raw loader support for *.html
          * Returns file content as string
          *
          * See: https://github.com/webpack/raw-loader
          */
         {
           test: /\.html$/,
           use: 'raw-loader',
           exclude: [helpers.root('src/index.html')]
         },
 
         /**
          * File loader for supporting images, for example, in CSS files.
          */
         {
           test: /\.(jpg|png|gif)$/,
           use: 'file-loader'
         },
 
         /* File loader for supporting fonts, for example, in CSS files.
         */
         {
           test: /\.(otf|eot|woff2?|svg|ttf)([\?]?.*)$/,
           use: [
            {
              loader: 'url-loader',
              options: {
                limit: false
              }
            }
          ]
         },
 
       ]
 
     },
 
     /**
      * Add additional plugins to the compiler.
      *
      * See: http://webpack.github.io/docs/configuration.html#plugins
      */
     plugins: [
       
       new webpack.ProvidePlugin({
         join: ['lodash', 'join'],
       }),
       new webpack.ContextReplacementPlugin(
         // The (\\|\/) piece accounts for path separators in *nix and Windows
       
         // For Angular 5, see also https://github.com/angular/angular/issues/20357#issuecomment-343683491
         /\@angular(\\|\/)core(\\|\/)fesm5/,
         helpers.root('src'), // location of your src
         {
           // your Angular Async Route paths relative to this root directory
         }
       ),
       /**
        * Plugin: ForkCheckerPlugin
        * Description: Do type checking in a separate process, so webpack don't need to wait.
        *
        * See: https://github.com/s-panferov/awesome-typescript-loader#forkchecker-boolean-defaultfalse
        */
       //new CheckerPlugin(),
       /**
        * Plugin: CommonsChunkPlugin
        * Description: Shares common code between the pages.
        * It identifies common modules and put them into a commons chunk.
        *
        * See: https://webpack.github.io/docs/list-of-plugins.html#commonschunkplugin
        * See: https://github.com/webpack/docs/wiki/optimization#multi-page-app
        */
        /*new  webpack.optimize.CommonsChunkPlugin({
         name: 'polyfills',
         chunks: ['polyfills']
       }),*/
       /**
        * This enables tree shaking of the vendor modules
        */
       // new CommonsChunkPlugin({
       //   name: 'vendor',
       //   chunks: ['main'],
       //   minChunks: module => /node_modules/.test(module.resource)
       // }),
       /**
        * Specify the correct order the scripts will be injected in
        */
       // new CommonsChunkPlugin({
       //   name: ['polyfills', 'vendor'].reverse()
       // }),
       // new CommonsChunkPlugin({
       //   name: ['manifest'],
       //   minChunks: Infinity,
       // }),
 
       /**
        * Plugin: ContextReplacementPlugin
        * Description: Provides context to Angular's use of System.import
        *
        * See: https://webpack.github.io/docs/list-of-plugins.html#contextreplacementplugin
        * See: https://github.com/angular/angular/issues/11580
        */
 
 
       /**
        * Plugin: CopyWebpackPlugin
        * Description: Copy files and directories in webpack.
        *
        * Copies project static assets.
        *
        * See: https://www.npmjs.com/package/copy-webpack-plugin
        */
       new CopyWebpackPlugin([
         { from: 'src/app/assets', to: 'assets' },
         { from: 'src/meta'}
       ],
         isProd ? { ignore: [ 'mock-data/**/*' ] } : undefined
       ),
 
       /*
        * Plugin: PreloadWebpackPlugin
        * Description: Preload is a web standard aimed at improving
        * performance and granular loading of resources.
        *
        * See: https://github.com/GoogleChrome/preload-webpack-plugin
        */
       //new PreloadWebpackPlugin({
       //  rel: 'preload',
       //  as: 'script',
       //  include: ['polyfills', 'vendor', 'main'].reverse(),
       //  fileBlacklist: ['.css', '.map']
       //}),
       //new PreloadWebpackPlugin({
       //  rel: 'prefetch',
       //  as: 'script',
       //  include: 'asyncChunks'
       //}),
 
       /**
        * Plugin: ScriptExtHtmlWebpackPlugin
        * Description: Enhances html-webpack-plugin functionality
        * with different deployment options for your scripts including:
        *
        * See: https://github.com/numical/script-ext-html-webpack-plugin
        */
       /*new ScriptExtHtmlWebpackPlugin({
         sync: /polyfill|vendor/,
         defaultAttribute: 'async',
         preload: [/polyfill|vendor|main/],
         prefetch: [/chunk/]
       }),*/
 
       /*
       * Plugin: HtmlWebpackPlugin
       * Description: Simplifies creation of HTML files to serve your webpack bundles.
       * This is especially useful for webpack bundles that include a hash in the filename
       * which changes every compilation.
       *
       * See: https://github.com/ampedandwired/html-webpack-plugin
       */
       new HtmlWebpackPlugin({
         template: 'src/index.html',
         title: METADATA.title,
         metadata: METADATA,
         favicon: "src/app/assets/img/favicon/favicon.ico",
         inject: 'body',
         gaid: isProd ? 'UA-83906400-3' : 'UA-114900360-2'
       }),
 
 
 
 
 
       /**
        * Plugin: InlineManifestWebpackPlugin
        * Inline Webpack's manifest.js in index.html
        *
        * https://github.com/szrenwei/inline-manifest-webpack-plugin
        */
     ],
 
     /**
      * Include polyfills or mocks for various node stuff
      * Description: Node configuration
      *
      * See: https://webpack.github.io/docs/configuration.html#node
      */
     node: {
       global: true,
       __filename: true,
       __dirname: true
     },
     optimization: {
       runtimeChunk: true
     }
   };
 }

// name: (resourcePath, resourceQuery) => {
//   const originalFilename = resourcePath.split('/').pop();
//   return `fonts/${originalFilename}`;
// },