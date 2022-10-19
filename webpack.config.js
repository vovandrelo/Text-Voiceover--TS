const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require('path');

const isDev = process.env.NODE_ENV === "development";

module.exports = {
	context: path.resolve(__dirname, 'src'),

	entry: {
		main: './index.ts',
	},

	resolve: {
		extensions: [".ts", ".tsx", ".js"]
	},

	output: {
		filename: `[name].${isDev ? "[contenthash]." : ""}js`,
		path: path.resolve(__dirname, 'dist'),
		clean: true,
	},

	module: {
		rules: [
			{
				test: /\.sass$/i,
				use: [
					isDev ? "style-loader" : MiniCssExtractPlugin.loader,
					"css-loader",
					"sass-loader"
				],
			},
			{
				test: /\.ts$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env', '@babel/preset-typescript'],
						cacheDirectory: true,
					}
				}
			},
			{
				test: /\.(png|svg|jpg|jpeg|gif)$/i,
				type: 'asset/resource',
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/i,
				type: 'asset/resource',
			},
		]
	},

	plugins: [
		new HtmlWebpackPlugin({ template: './index.html', title: "vovandrelo" }),
		new CopyPlugin({ patterns: [{ from: './assets/favicon.ico', to: path.resolve(__dirname, 'dist') }]}),
	].concat(isDev ? [] : [new MiniCssExtractPlugin({ filename: `[name].${isDev ? "[contenthash]." : ""}css` })]),

	devServer: {
		static: {
			directory: "./"
		},
		compress: true,
		port: 9000,
		open: true,
	},

	optimization: {
		splitChunks: {
			chunks: "all",
		}
	},

	devtool: isDev ? 'source-map' : false,
};