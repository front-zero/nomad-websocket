console.log('hello app.js');


/**
 * socket io + video
 */

const socket = io();

const welcome = document.querySelector('#welcome');
const call = document.querySelector('#call');
call.style.display = 'none';

const myFace = document.querySelector('#myFace');
const muteBtn = document.querySelector('#mute');
const cameraBtn = document.querySelector('#camera');
const cameraSelect = document.querySelector('#cameras');

let myStream;
let myPeerConnection;

async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log(devices);
        const cameras = devices.filter(device => device.kind === 'videoinput');
        console.log(cameras);
        cameras.forEach(camera => {
            const option = document.createElement('option');
            option.value = camera.deviceId;
            option.innerText = camera.label.split('(')[0];
            cameraSelect.appendChild(option);
        });
    } catch (err) {
        console.error(err);
    }
}

async function getMedia(deviceId) {
    const initialConstrains = {
        audio: true,
        video: {
            facingMode: 'user'
        }
    };

    const cameraConstrains = {
        audio: true,
        video: {
            deviceId: {
                exact: deviceId
            }
        },
    }

    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstrains : initialConstrains
        );
        console.log(myStream);
        myFace.srcObject = myStream;
        if (!deviceId) await getCameras();
    } catch (err) {
        console.error(err);
    }
};

// getMedia();

let isMute = false;
let isCamera = false;
let roomName;

muteBtn.addEventListener('click', () => {
    if (!isMute) {
        muteBtn.innerText = 'Unmute';
    } else {
        muteBtn.innerText = 'Mute';
    }
    myStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
    isMute = !isMute;
});

cameraBtn.addEventListener('click', () => {
    if (!isCamera) {
        cameraBtn.innerText = 'Turn Camera On';
    } else {
        cameraBtn.innerText = 'Turn Camera Off';
    }
    myStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
    isCamera = !isCamera;
});

cameraSelect.addEventListener('change', async () => {
    console.log(cameraSelect.value);
    await getMedia(cameraSelect.value);
    if(myPeerConnection) {
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = myPeerConnection.getSenders().find(sender => sender.track.kind === 'video');
        videoSender.replaceTrack(videoTrack);
    }
});

const welcomeForm = welcome.querySelector('form');
welcomeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = welcomeForm.querySelector('input');
    if (input.value === '') return false;
    await startMedia();
    socket.emit('joinRoom', input.value);
    roomName = input.value;
    input.value = '';
});

async function startMedia() {
    call.style.display = 'flex';
    welcome.style.display = 'none';
    await getMedia();
    makeConnection();
};

// socket

socket.on('welcome', async () => {
    console.log('someone joined');
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    socket.emit('offer', offer, roomName); // send offer
});

socket.on('offer', async (offer) => {
    myPeerConnection.setRemoteDescription(offer); // receive offer
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer); // send answer
    socket.emit('answer', answer, roomName);
});

socket.on('answer', (answer) => {
    myPeerConnection.setRemoteDescription(answer); // receive answer
});

socket.on('ice', (iceCandidate) => {
    if (iceCandidate) {
        console.log('ice', iceCandidate);
        myPeerConnection.addIceCandidate(iceCandidate); // receive iceCandidate
    }
});

// RTC

function makeConnection() {
    myPeerConnection = new RTCPeerConnection({
        iceServers: [
            {
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun3.l.google.com:19302",
                    "stun:stun4.l.google.com:19302"
                ]
            }
        ]
    });
    console.log(myStream.getTracks());
    myPeerConnection.addEventListener('track', (data) => {
        console.log('ontrack', data);
        const peerStreamEl = document.querySelector('#peerStream');
        peerStreamEl.srcObject = data.streams[0];
    });
    myPeerConnection.addEventListener('icecandidate', (data) => {
        console.log('sent candidate');
        socket.emit('ice', data.candidate, roomName);
    });
    myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream));
};