/*

socket listeners

*/

module.exports = function(io){

	//var globalCrawlerHandler = require('./globalCrawlerHandler');
	//var crawlerInfoHandler = require('./crawlerInfoHandler');

	io.sockets.on('connection', function (socket) {

		//connected
		socket.emit('connected', {status: 'ok'});

		// //start the global crawler
		// socket.on('start global crawler', function(data){
		// 	globalCrawlerHandler(data, socket);
		// });

		// socket.on('get crawler info', function(data){
		// 	crawlerInfoHandler(data, socket);
		// });

	});
};