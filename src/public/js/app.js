console.log('hello app.js');

// const connectionForm = document.querySelector("#ws-connection");
// const ul = document.querySelector('ul');
// const messageForm = document.querySelector('#ws-message');
//
// // ws 연결
// const ws = new WebSocket(`ws://${location.host}`);
// ws.addEventListener("open", () => {
//     console.log("connected to WebSocket")
// });
//
// ws.addEventListener("message", (message) => {
//     console.log(`${message.data} from server`);
//     const li = document.createElement('li');
//     li.innerText = message.data;
//     ul.append(li);
// });
//
// ws.addEventListener("close", () => {
//     console.log("disconnected to WebSocket")
// });
//
// // setTimeout(() => {
// //     ws.send("server hi! from client");
// // }, 1500);
//
// messageForm.addEventListener('submit', (e) => {
//     e.preventDefault();
//     const input = messageForm.querySelector('input[type="text"]');
//     ws.send(JSON.stringify({
//         type: 'message',
//         payload: input.value,
//     }));
//     input.value = '';
// });
//
// connectionForm.addEventListener('submit', (e) => {
//     e.preventDefault();
//     const input = connectionForm.querySelector('input[type="text"]');
//     if(!input.value) return false;
//     ws.send(JSON.stringify({
//         type: 'nickName',
//         payload: input.value,
//     }));
//     input.value = '';
// });

/**
 * Socket IO
 */

const socket = io();

const roomForm = document.querySelector("#roomForm");
const messageForm = document.querySelector('#messageForm');
const nickForm = document.querySelector('#nickForm');

let currentRoomName = '';
let currentNickName = 'anonymous';

const showRoom = (targetRoomName) => {
    const h3 = document.querySelector('#roomName');
    h3.innerText = `Room ${targetRoomName}`;
};

const setCurrentNickName = () => {
    const h4 = document.querySelector('#currentNickName');
    h4.innerText = `nickName: ${currentNickName}`;
};
nickForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nickInput = nickForm.querySelector('input');
    if (nickInput.value === '') return false;
    socket.emit('nickName', nickInput.value);
    currentNickName = nickInput.value;
    setCurrentNickName();
    nickInput.value = '';
});
roomForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const roomInput = roomForm.querySelector('input');
    if (roomInput.value === '') return false;
    socket.emit('enterRoom', {
        payload: roomInput.value
    }, () => {
        console.log("server is done!");
        showRoom(roomInput.value);
        if(currentRoomName !== '') socket.emit('leaveRoom', currentRoomName);
        currentRoomName = roomInput.value;
        roomInput.value = '';
    });
});
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const messageInput = messageForm.querySelector('input');
    if (messageInput.value === '') return false;
    socket.emit('newMessage', messageInput.value, currentRoomName, () => {
        // addMessage(`You: ${messageInput.value}`);
        messageInput.value = ''
    });
});

const addMessage = (msg) => {
    const ul = document.querySelector('#messageList');
    const li = document.createElement('li');
    li.innerText = msg;
    ul.appendChild(li);
};
socket.on('welcome', (nickName) => {
    addMessage(`${nickName} joined!`);
});
socket.on('bye', (nickName) => {
    addMessage(`${nickName} left!`);
});
socket.on('newMessage', addMessage);
socket.on('rooms', (targetRooms) => {
    const roomList = document.querySelector('#roomList');
    const fragment = document.createDocumentFragment();
    const li = document.createElement('li');
    targetRooms.forEach(room => {
        li.innerText = room;
        fragment.appendChild(li);
    })
    roomList.appendChild(fragment);
});

socket.on('connect', () => {
   console.log('connection socket io');
   socket.emit('getRooms');
});