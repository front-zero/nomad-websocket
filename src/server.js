import * as http from 'http';
import express from 'express';
import {Server} from 'socket.io';

const app = express();
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (req, res) => res.render('home'));
const PORT = 3000;

const httpServer = http.createServer(app);

const io = new Server(httpServer);

io.on('connection', socket => {
   socket.on('joinRoom', (roomName) => {
       socket.join(roomName);
       socket.to(roomName).emit('welcome');
   });
   socket.on('offer', (offer, roomName) => {
        socket.to(roomName).emit('offer', offer);
   });
    socket.on('answer', (answer, roomName) => {
        socket.to(roomName).emit('answer', answer);
    });
    socket.on('ice', (iceCandidate, roomName) => {
        socket.to(roomName).emit('ice', iceCandidate);
    });
});

httpServer.listen(PORT, () => {
    console.log(`listen ${PORT}`);
});
