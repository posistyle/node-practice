var http = require('http');

var fs = require('fs');

var path = require('path');

var mime = require('mime');

var cache = {};

//1.发送文件数据及错误响应

function send404(res) {
	res.writeHead(404, {'content-Type': 'text/plain'});
	res.write('Error 404: resource not found');
	res.end();
}	

function sendFile(res, filePath, fileContents) {
	res.writeHead(200, {
		'content-Type': mime.lookup(path.basename(filePath))
	})
	res.end(fileContents);
}

function serveStatic(res, cache, absPath) {
	if(cache[absPath]) {
		sendFile(res, absPath, cache[absPath]);//从内存中返回文件
	}else {
		fs.exists(absPath, function(exists){//检查文件是否存在
			if(exists) {
				fs.readFile(absPath, function(err, data){ //从硬盘中读取文件
					if(err) {
						send404(res);
					}else {
						cache[absPath] = data;
						sendFile(res, absPath, data);
					}
				})
			}else {
				send404(res);//发送HTTP404响应
			}
		})
	}
}

var server = http.createServer(function(req, res){
	var filePath = false;
	if(req.url == '/') {
		filePath = 'public/index.html';
	}else {
		filePath = 'public' + req.url;
	}
	var absPath = './' +filePath;
	serveStatic(res, cache, absPath);
});

server.listen(2000, function(){
	console.log('server listening on port 3000');
})

var chatServer = require('./lib/chat_server');
chatServer.listen(server);//启动socket.IO服务器



