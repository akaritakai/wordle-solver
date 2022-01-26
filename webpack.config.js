const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserJsPlugin = require('terser-webpack-plugin');

const isProduction = process.env.NODE_ENV == 'production';

const config = {
  entry: {
    app: './src/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.js$/i,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          compact: true
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.scss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ],
      }
    ]
  }
};

module.exports = () => {
  if (isProduction) {
    config.mode = 'production';
    config.optimization = {
      minimize: true,
      minimizer: [
        new TerserJsPlugin({
          terserOptions: {
            output: {
              comments: false
            }
          },
          extractComments: false
        }),
        new CssMinimizerPlugin()
      ]
    };
    config.plugins = [
      new VueLoaderPlugin(),
      new MiniCssExtractPlugin({
        filename: '[name].css'
      }),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        chunks: ['app'],
        inject: true,
        templateContent: `
          <!DOCTYPE html>
          <html lang='en-US'>
          <head>
            <meta charset='utf-8'>
            <title>Wordle Solver</title>
          </head>
          <body>
            <div id='app'></div>
          </body>
          </html>
        `,
        scriptLoading: 'defer',
        meta: {
          description: 'a wordle solver',
          viewport: 'width=device-width, initial-scale=1'
        },
        minify: {
          collapseWhitespace: true,
          html5: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          sortAttributes: true,
          sortClassName: true,
          useShortDoctype: true
        }
      })
    ];
  } else {
    config.mode = 'development';
    config.optimization = {
      minimize: false
    };
    config.plugins = [
      new VueLoaderPlugin(),
      new MiniCssExtractPlugin({
        filename: '[name].css'
      }),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        chunks: ['app'],
        inject: true,
        templateContent: `
          <!DOCTYPE html>
          <html lang='en-US'>
          <head>
            <meta charset='utf-8'>
            <title>Wordle Solver</title>
          </head>
          <body>
            <div id='app'></div>
          </body>
          </html>
        `,
        scriptLoading: 'defer',
        meta: {
          description: 'a wordle solver',
          viewport: 'width=device-width, initial-scale=1'
        }
      })
    ];
  }
  return config;
};
