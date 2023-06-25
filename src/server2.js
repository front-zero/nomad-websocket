/**
 * Socket IO
 */
import * as http from 'http';
import express from 'express';
import {Server} from 'socket.io';

const app = express();
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (req, res) => res.render('home'));
const PORT = 3000;

const server2 = http.createServer(app);

const io = new Server(server2);
io.on('connection', (socket) => {
    console.log('connection..!', socket.id);
    socket['nickName'] = 'anonymous';
    socket.leave(socket.id); // 이걸 없애면, 중복 이벤트명 같은 경우에는 발신자를 제외시킴(newMessage)

    const refreshRooms = () => {
        const rooms = io.sockets.adapter.rooms.keys();
        socket.emit('rooms', [...rooms]);
    };

    socket.on('enterRoom', (msg, done) => {
        console.log(msg);
        const roomName = msg.payload;
        socket.join(roomName);
        done();
        socket.to(roomName).emit('welcome', socket['nickName']);
        refreshRooms();
    });
    socket.on('leaveRoom', (room) => {
        socket.to(room).emit('bye', socket['nickName']);
        socket.leave(room);
        refreshRooms()
    });
    socket.on('disconnecting', () => {
        socket.rooms.forEach(room => socket.to(room).emit('bye', socket['nickName']));
    });
    socket.on('newMessage', (msg, room, done) => {
        socket.to(room).emit('newMessage', `${socket['nickName']}: ${msg}`);
        done();
    });
    socket.on('nickName', (targetNickName) => {
        socket['nickName'] = targetNickName;
    });
    socket.on('getRooms', () => {
        refreshRooms();
    });
});


server2.listen(PORT, () => {
    console.log(`listen ${PORT}`);
});
