console.log('hello app2.js');

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