var webpack = require('webpack');
module.exports = {
	devtool: 'source-map',
	entry: {
		'steiner':      ['./src/steiner.es6.js'],
		'steiner.full': [ 'babel-core/polyfill.js', './src/steiner.es6.js' ]
	},
	output: {
		path: './dist',
		filename: '[name].js',
		library: 'steiner',
		libraryTarget: 'umd',
		sourceMapFilename: '[file].map'
	},
	module: {
		loaders: [
			{ test: /\.es6\.js$/, loader: 'babel?compact=false' }
		]
	},
	plugins: [
		new webpack.optimize.OccurenceOrderPlugin()
	]
};
