import * as http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import express from 'express';
const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"))

app.get("/", (req, res) => res.render("home"));

const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`listen ${PORT}`);
// });

const server = http.createServer(app);
const wss = new WebSocketServer({server}); // 포트를 공유하여, http 서버와 ws 서버를 생성

const sockets = [];
wss.on("connection", (socket) => {
    // console.log("connection");
    // console.log(socket);
    sockets.push(socket);
    socket['nickName'] = 'Unknown';
    socket.on("close", () => console.log("소켓 연결 끊김.."));
    socket.on("message", (message) => {
        console.log(message);
        // socket.send(message.toString('utf8'));
        const targetMessage = JSON.parse(message);
        sockets.forEach(targetSocket => {
            switch (targetMessage.type) {
                case 'nickName' :
                    socket['nickName'] = targetMessage.payload.toString('utf8');
                    break;
                case 'message':
                    targetSocket.send(`${socket['nickName']}: ${targetMessage.payload.toString('utf8')}`);
                    break;

            }
        });
    });
    socket.send("Welcome Socket");
});

server.listen(PORT, () => {
    console.log(`listen ${PORT}`);
});