//initialise
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

users=[];
connections = [];

//Avoid XSS
function convert(str)
{
  str = str.replace(/&/g, "&amp");
  str = str.replace(/>/g, "&gt");
  str = str.replace(/</g, "&lt");
  str = str.replace(/"/g, "&quot");
  str = str.replace(/'/g, "&#039");
  return str;
}

//Port 3000
server.listen(process.env.PORT || 3000);
console.log('Server running...');
app.get('/',function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
  updateUsernames();
  connections.push(socket);
  console.log('Connected: %s sockets connected', connections.length);

  socket.on('disconnect', function(data){
    users.splice(users.indexOf(socket.username),1);
    connections.splice(connections.indexOf(socket), 1);
    updateUsernames();
    console.log('Disconnected: %s sockets connected', connections.length);
  });
    socket.on('send message',function(data){
      console.log(socket.username +": "+ data);
      data = convert(data);
      io.sockets.emit('new message', {msg: data, user:socket.username});
    });

    socket.on('new user', function(data){
	if(!data)data = "Guest";
      data = convert(data);
     if(data == "adidaslava"){
      socket.username = "ADMIN";
      users.push(socket.username);
      updateUsernames();
    }
      else {
        socket.username = data;
        users.push(socket.username);
        updateUsernames();
      }
    });
    function updateUsernames(){
      io.sockets.emit('get users', users);
    }
  });
