const isDev = !!process.env.dev;
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')

let setting = {
  entry: path.join(__dirname, 'src/index.ts'),
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'bundle-[hash].js',
  },
  devServer: {
    contentBase: path.join(__dirname, '/dist'),
    port: 8080
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [{
      test: /\.ts/,
      use: 'ts-loader',
      exclude: /\.\/node_modules/
    }, {
      test: /\.html$/,
      use: 'raw-loader',
      exclude: /\.\/node_modules/
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/index.html'
    })
  ]
};

if (isDev) {
  let _addLoaders = [{
    test: /\.(png|woff|woff2|eot|ttf|svg)$/,
    use: 'url-loader?limit=100000'
  }, {
    test: /\.(css|less)$/,
    use: [{
      loader: 'style-loader' // creates style nodes from JS strings
    }, {
      loader: 'css-loader' // translates CSS into CommonJS
    }, {
      loader: 'less-loader' // compiles Less to CSS
    }]
  }];
  setting['devServer']['inline'] = true;
  setting['devtool'] = 'source-map';
  setting['module']['rules'].push(..._addLoaders);
} else {
  // compile less
  const MiniCssExtractPlugin = require("mini-css-extract-plugin");
  const extractLESS = new MiniCssExtractPlugin({ filename: '[name]-[hash].css' });

  let _addLoaders = [{
    test: /\.(jpe?g|gif|png|svg|woff|woff2|eot|ttf|wav|mp3)$/,
    loader: 'file-loader'
  }, {
    test: /\.css$/,
    use: [
      MiniCssExtractPlugin.loader,
      'css-loader',
      'postcss-loader'
    ]
  }, {
    test: /\.less$/i,
    use: [
      MiniCssExtractPlugin.loader,
      'css-loader',
      'less-loader'
    ]
  }];

  setting['module']['rules'].push(..._addLoaders);
  setting['plugins'].push(extractLESS);


  // minify js setting
  setting['plugins'].push(
    new UglifyJsPlugin({
      uglifyOptions: {
        ecma: 7,
        ie8: false,
        cache: true,
        parallel: true,
        compress: {
          passes: 3,
          inline: 3
        },
        output: {
          comments: false,
          beautify: true // comment out or set to false for production
        }
      },
      sourceMap: false
    })
  );
}
module.exports = setting;
