const path = require("path");
const webpack = require("webpack");
const { VueLoaderPlugin } = require("vue-loader");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const nodeExternals = require("webpack-node-externals");
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const packageVersion = require("./package.json").version;
const banner = `
vue3-treeselect v${packageVersion} | (c) ${new Date().getFullYear()} Andreas Johansson
Released under the MIT License.
https://vue3-treeselect.js.org/
`.trim();

const baseConfig = {
  entry: "./src/index.js",

  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: "vue3-treeselect.min.css",
      chunkFilename: "[id].css"
    }),
    new webpack.DefinePlugin({
      PKG_VERSION: JSON.stringify(packageVersion)
    }),
    new webpack.BannerPlugin(banner)
  ],

  optimization: {
    concatenateModules: true,
    emitOnErrors: false,
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          sourceMap: false
        }
      }),
      new CssMinimizerPlugin()
    ]
  },

  externals: [nodeExternals()],

  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader",
        options: {
          babelParserPlugins: ["jsx", "classProperties", "decorators-legacy"]
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
        use: [MiniCssExtractPlugin.loader, "css-loader", "less-loader"]
      },
      {
        test: /\.(png|jpg|jpeg|ico)/,
        type: "asset/inline"
      }
    ]
  }
};

module.exports = [
  {
    ...baseConfig,
    output: {
      path: path.join(__dirname, "dist/"),
      libraryTarget: "commonjs2",
      filename: "vue3-treeselect.cjs.min.js"
    }
  },
  {
    ...baseConfig,
    output: {
      path: path.join(__dirname, "dist/"),
      libraryTarget: "umd",
      filename: "vue3-treeselect.umd.min.js"
    }
  }
];
