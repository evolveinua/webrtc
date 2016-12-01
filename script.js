/*window.onload = () => {
    navigator.mozGetUserMedia({video: true}, getStream, noStream);
};

function getStream(stream) {
    let url = URL.createObjectURL(stream);
    video.src = url;
};

function noStream(faild) {

};*/

let PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection,
    IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate,
    SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription,
    pc;

navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
navigator.getUserMedia({audia: true, video: true},
    goStream,
    error => { console.log('Error') });

function goStream(stream) {
    document.getElementById('call-button').style.display = 'inline-block';
    document.getElementById('local-video').src = URL.createObjectURL(stream);

    pc = new PeerConnection(null);
    pc.addStream(stream);
    pc.onicecandidate = gotIceCandidate;
    pc.onaddstream = gotRemoteStream;
}

function createOffer() {
    pc.createOffer(
        gotLocalDescription,
        error => { console.log('error') },
        { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } }
    );
}

function callAnswer() {
    pc.createAnswer(
        gotLocalDescription,
        error => { console.log('error') },
        { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } }
    );
}

function gotIceCandidate(event) {
    if(event.candidate) {
        sendMessage({
            type: 'canvalidate',
            label: event.candidate.sdpMid,
            candidate: event.candidate.candidate
        });
    }
}

let socket = io.connect('', {port: 1234});

socket.on('message', message => {
    if(message.type == 'offer') {
        pc.setRemoteDescription(new SessionDescription(message));
        createAnswer();
    } else if(message.type == 'answer') {
        pc.setRemoteDescription(new SessionDescription(message));
    } else if(message.type == 'candidate') {
        let candidate = new IceCandidate({ 
            sdpMLineIndex: message.label, 
            candidate: message.candidate,

         });
         pc.addIceCandidate(candidate);
    }
});

function gotRemoteStream(event) {
    document.gotElementById('remote-video').src = URL.createObjectURL(event.stream);
}