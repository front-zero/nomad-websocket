console.log('hello app.js');

const connectionForm = document.querySelector("#ws-connection");
const ul = document.querySelector('ul');
const messageForm = document.querySelector('#ws-message');

// ws 연결
const ws = new WebSocket(`ws://${location.host}`);
ws.addEventListener("open", () => {
    console.log("connected to WebSocket")
});

ws.addEventListener("message", (message) => {
    console.log(`${message.data} from server`);
    const li = document.createElement('li');
    li.innerText = message.data;
    ul.append(li);
});

ws.addEventListener("close", () => {
    console.log("disconnected to WebSocket")
});

// setTimeout(() => {
//     ws.send("server hi! from client");
// }, 1500);

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = messageForm.querySelector('input[type="text"]');
    ws.send(JSON.stringify({
        type: 'message',
        payload: input.value,
    }));
    input.value = '';
});

connectionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = connectionForm.querySelector('input[type="text"]');
    if(!input.value) return false;
    ws.send(JSON.stringify({
        type: 'nickName',
        payload: input.value,
    }));
    input.value = '';
})