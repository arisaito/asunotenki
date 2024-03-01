const path = require("path");
const BrowserSyncPlugin = require("browser-sync-webpack-plugin");
const globule = require("globule");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const dotenv = require("dotenv");
const env = dotenv.config().parsed;
const webpack = require("webpack");

const app = {
  mode: "development",
  target: "node",
  entry: {
    script: "./src/ts/script.ts",
  },

  output: {
    path: path.join(__dirname, "build/static/js/"),
    filename: "[name].bundle.js",
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
      },
      {
        test: /\.pug$/,
        use: [
          {
            loader: "pug-loader",
            options: {
              pretty: true,
            },
          },
        ],
      },
    ],
  },

  resolve: {
    extensions: [".ts", ".js"],
    fallback: {
      path: require.resolve("path-browserify"),
    },
  },

  target: ["web", "es5"],

  plugins: [
    new BrowserSyncPlugin({
      host: "localhost",
      port: 3000,
      https: true,
      files: "**/*",
      server: { baseDir: ["build"] },
      open: "external",
    }),
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
  ],
};

const templates = globule.find("./src/pug/**/*.pug", {
  ignore: ["./src/pug/**/_*.pug"],
});

templates.forEach((template) => {
  const fileName = template.replace("./src/pug/", "").replace(".pug", ".html");
  app.plugins.push(
    new HtmlWebpackPlugin({
      filename: `../../${fileName}`,
      template: template,
      inject: false,
      minify: false,
    })
  );
});

module.exports = app;
