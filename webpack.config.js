const path = require('path');

module.exports = {
	entry: Object.fromEntries([
		'content',
		'eventPage',
		'options',
	].map(name => [name, './src/' + name])),
	output: {
		path: path.resolve('dist/build'),
	},
	devtool: 'cheap-module-source-map',
};
