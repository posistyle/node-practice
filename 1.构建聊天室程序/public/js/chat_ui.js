function divEscapedContentElement(messages) {
	return $('<div><div>').text(messages);
}
function divSystemContentElement(messages) {
	return $('<div><div>').html('<i>' + messages + '</i>');
}

//处理原始的用户输入
function processUserInput(chatApp, socket) {
	var messages = $('#send-messages').val();
	var systemMessage;
	if(messages.charAt(0) == '/') {
		systemMessage = chatApp.processCommand(messages);
		if(systemMessage) {
			$('#messages').append(divSystemContentElement(systemMessage))
		}
	}else {
		chatApp.sendMessage($('#room').text(), messages);
		$('#messages').append(divEscapedContentElement(messages));
		$('#messages').scrollTop($('#messages').prop('scrollHeight'))
	}
	$('#send-messages').val('');
}	

//客户端程序初始化逻辑
var socket = io.connect();

$(function(){
	var chatApp = new Chat(socket);

	socket.on('nameResult', function(){
		var messages;
		if(result.success) {
			messages = 'you are now know as' + result.name;
		}else {
			messages = result.messages;
		}
		$('#messages').append(divEscapedContentElement(messages));
	})

	socket.on('joinResult', function() {
		$('#room').text(result.room);
		$('#messages').append(divSystemContentElement('Room changed'))
	})

	socket.on('messages', function() {
		var newElement = $('<div></div>').text(messages.text);
		$('#messages').append(newElement);
	})

	socket.on('rooms', function(rooms) {
		$('#room-list').empty();
		for(var room in rooms) {
			room = room.substring(1, room.length);
			if(room != '') {
				$('#room-list').append(divEscapedContentElement(room));
			}
		}
		$('#room-list div').on('click', function() {
			chatApp.processCommand('/join' + $(this).text());
			$('#send-message').focus();
		});
	})

	setInterval(function(){
		socket.emit('rooms')
	},1000);

	$('#send-message').focus();

	$('#send-form').submit(function(e){
	 	e.stopPropagation();
		processUserInput(chatApp, socket);
		return false;
	})

})







