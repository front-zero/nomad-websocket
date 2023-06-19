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
wss.on("connection", (socket) => {
    console.log("connection");
    console.log(socket);
});

server.listen(PORT, () => {
    console.log(`listen ${PORT}`);
});