var Chat = function(socket) {
	this.socket = socket;
}

Chat.prototype.sendMessage = function(room, text) {
	var message = {
		room: room,
		text: text
	}
	console.log(message);
	this.socket.emit('message', message);
}

Chat.prototype.changeRoom = function(room) {
	this.socket.emit('join', {
		newRoom: room
	})
}

Chat.prototype.processCommand = function (command) {
	var words = command.split('');
	console.log(words);
	var command = words[0].substring(1, words[0].lenght).toLowerCase();
	var message = false;

	switch(command) {
		case 'join':
			words.shift();
			var room = words.join('');
			this.changeRoom(room);
			break;
		case 'nike':
			words.shift();
			var name = words.join('');
			this.socket.emit('nameAttempt', name);
			break;
		default:
			message = 'unrecognized command';
			break;
	}
	return message;
}