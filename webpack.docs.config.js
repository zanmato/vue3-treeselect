const path = require("path");
const webpack = require("webpack");
const { VueLoaderPlugin } = require("vue-loader");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: "./docs/main.js",

  output: {
    path: path.join(__dirname, "gh-pages/"),
    publicPath: "/"
  },

  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({ template: "./docs/index.html" }),
    new MiniCssExtractPlugin({
      filename: "style.css"
    }),
    new webpack.DefinePlugin({
      PKG_VERSION: JSON.stringify(require("./package.json").version)
    })
  ],

  module: {
    rules: [
      {
        test: /\.vue$/,
        resourceQuery: { not: [/raw/] },
        loader: "vue-loader",
        options: {
          babelParserPlugins: ["jsx", "classProperties", "decorators-legacy"],
          compilerOptions: {
            whitespace: "preserve"
          }
        }
      },
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: "babel-loader",
          options: {
            plugins: ["@vue/babel-plugin-jsx"]
          }
        }
      },
      {
        test: /\.less$/,
        use: ["vue-style-loader", "css-loader", "less-loader"]
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"]
      },
      {
        test: /\.(png|jpg|jpeg|ico)/,
        type: "asset/resource",
        generator: {
          // output filename of images
          filename: "assets/img/[name].[hash:8][ext]"
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf|svg)$/i,
        type: "asset/resource",
        generator: {
          // output filename of fonts
          filename: "assets/fonts/[name][ext][query]"
        }
      },
      {
        resourceQuery: /raw/,
        type: "asset/source"
      }
    ]
  }
};
