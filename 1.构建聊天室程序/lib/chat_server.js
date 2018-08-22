var socketio = require('socket.io');
var io;
var guesNumber = 1;
var nikename = {};
var nameUsed = [];
var currentRoom = {};

exports.listen = function(server) {
	io = socketio.listen(server);//	启动socket.IO服务器，允许搭载已有的hTTP服务区上
	io.set('log level', 1);
	io.sockets.on('connection', function(socket) {//定义每个用户的连接的处理逻辑
		guesNumber = assignGuestName(socket, guesNumber, nikename, nameUsed); //用户连接上来时赋予其一个访客名
		joinRoom(socket, 'Lobby');
		handleMessageBroadcasting(socket, nikename);
		handleNameChangeAttempts(socket, nikename, nameUsed);
		handleRoomJoining(socket);
		socket.on('rooms', function() {
			socket.emit('rooms', io.sockets.manager.rooms);
		});

		handleClientDisconnection(socket, nikename, nameUsed);
	});

}

//分配用户昵称
function assignGuestName(socket, guesNumber, nikename, nameUsed) {
	var name = 'Guest' + guesNumber;
	nikename[socket.id] = name;
	socket.emit('nameResult', {
		success: true,
		name: name
	});
	nameUsed.push(name);
	return guesNumber ++;
}

//进入聊天室
function joinRoom(socket, room) {
	socket.join(room);
	currentRoom[socket.id] = room;//记录用户的当前房间
	socket.emit('joinResult', {
		room: room
	});
	socket.broadcast.to(room).emit('message', {//通知房间其他用户有新用户进入房间
		text: nikename[socket.id] + 'has joined' + room
	});
	var usersInRoom = io.sockets.clients(room);
	if(usersInRoom.length > 1) {//如果房间不是一个用户，汇总用户信息
		var userInRoomsummary = 'users currently in' + room;
		for(var index in usersInRoom) {
			var usersocketId = usersInRoom[index].id;
			if(usersocketId != socket.id) {
				if(index > 0) {
					userInRoomsummary +=',';
				}
				userInRoomsummary += nikename[usersocketId];
			}
		}
		userInRoomsummary += '.';
		socket.emit('message', {text: userInRoomsummary});//将汇总的用户信息发送当前用户
	}
}

//处理昵称变更请求
function handleNameChangeAttempts(socket, nikename, nameUsed) {
	socket.on('nameAttempt', function(name) {
		if(name.indexOf('Guest') == 0) {
			socket.emit('nameResult', {
				success: false,
				message: 'Names cannot begin with "Guest"'
			});
		}else {
			if(nameUsed.indexOf(name) == -1) {
				var previousName = nikename[socket.id];
				var previousNameIndex = nameUsed.indexOf(previousName);
				nameUsed.push(name);
				nikename[socket.id] = name;
				delete nameUsed[previousNameIndex];
				socket.emit('nameResult', {
					success: true,
					name: name
				});
				socket.broadcast.to(currentRoom[socket.id].emit('message', {
					text: previousName + 'is now know as' + name
				}))
			}else {
				socket.emit('nameResult', {
					success: false,
					message: 'that name is already in use'
				})
			}
		}
	})
}

//发送聊天消息
function handleMessageBroadcasting(socket) {
	socket.on('message', function(message){
		console.log(message.text)
		socket.broadcast.to(message.room).emit('message', {
			text: nikename[socket.id] + ':' + message.text
		})
		
	});
}

//创建房间
function handleRoomJoining(socket) {
	socket.on('join', function(room) {
		socket.level(currentRoom[socket.id]);
		joinRoom(socket, room.newRoom);
	});
}

//用户断开
function handleClientDisconnection(socket) {
	socket.on('disconnect', function() {
		var nameIndex = nameUsed.indexOf(nikename[socket.id]);
		delete nameUsed[nameIndex];
		delete nikename[socket.id];
	});
}













