const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  // CUSTOMIZE HERE
  entry: {
    server: "./src/executable/server.ts",
    "updator-master": "./src/executable/updator-master.ts",
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js",
  },
  optimization: {
    minimize: true,
  },

  // JUST KEEP THEM
  externals: [nodeExternals()],
  mode: "production",
  target: "node",
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
};
