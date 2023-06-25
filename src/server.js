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


server2.listen(PORT, () => {
    console.log(`listen ${PORT}`);
});
