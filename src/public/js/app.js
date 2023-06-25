console.log('hello app.js');


/**
 * socket io + video
 */

const socket = io();

const myFace = document.querySelector('#myFace');
let myStream;
async function getMedia() {
    try {
        myStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        console.log(myStream);
        myFace.src = myStream;
    } catch (err) {
        console.error(err);
    }
}

getMedia();