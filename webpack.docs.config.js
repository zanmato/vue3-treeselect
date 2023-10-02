const path = require("path");
const webpack = require("webpack");
const { VueLoaderPlugin } = require("vue-loader");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const devConfig = {
  entry: "./docs/main.js",

  output: {
    path: path.join(__dirname, "gh-pages/"),
    publicPath: "/"
  },

  resolve: {
    alias: {
      "@": path.join(path.resolve(__dirname), "docs")
    }
  },

  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({ template: "./docs/index.html" }),
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
        test: /\.(less|css)$/,
        use: ["vue-style-loader", "css-loader", "less-loader"]
      },
      {
        test: /\.(png|jpg|jpeg|ico)/,
        type: "asset/resource",
        generator: {
          filename: "static/img/[name].[hash:8][ext]"
        }
      },
      {
        resourceQuery: /raw/,
        type: "asset/source"
      }
    ]
  }
};

const prodConfig = {
  entry: "./docs/main.js",

  output: {
    path: path.join(__dirname, "gh-pages/"),
    filename: "static/js/[name].[chunkhash].js",
    chunkFilename: "[id].[chunkhash].js",
    publicPath: "/vue3-treeselect/"
  },

  resolve: {
    alias: {
      "@": path.join(path.resolve(__dirname), "docs")
    }
  },

  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({ template: "./docs/index.html" }),
    new MiniCssExtractPlugin({
      filename: "static/css/[name].[contenthash].css",
      chunkFilename: "[id].css"
    }),
    new webpack.DefinePlugin({
      PKG_VERSION: JSON.stringify(require("./package.json").version)
    })
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
        test: /\.(css|less)$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "less-loader"]
      },
      {
        test: /\.(png|jpg|jpeg|ico)/,
        type: "asset/resource",
        generator: {
          filename: "static/img/[name].[hash:8][ext]"
        }
      },
      {
        resourceQuery: /raw/,
        type: "asset/source"
      }
    ]
  }
};

module.exports = (env, argv) => {
  return argv.mode === "production" ? prodConfig : devConfig;
};
