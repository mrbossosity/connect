$("#banner-orange").hide()
$("#call-modal").hide()
$("#video-container").hide()
$("#username").focus()
var connectButton = 'hidden'
function showButton() {
    if (connectButton == 'hidden') {
        $("#banner-orange").show();
        connectButton = 'shown';
        $("#banner").hide()
    } 
}
$("#username").keydown(() => {
    showButton()
})

var username, peerID

const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
function makeID() {
    var id = ''
    var x = 0
    while (x < 6) { 
        let digit = digits[Math.floor(Math.random() * digits.length)]
        id += digit
        x ++
    }
    return id
}

function getID() {
    if ($("#peer-id").val() !== '') {
        peerID = $("#peer-id").val()
    } else {
        peerID = makeID()
    }
}

function getInfo() {
    username = $("#username").val()
    getID();
    console.log(`NAME: ${username}, ID: ${peerID}`);
    $("#main-modal").hide(300);
    $("#call-modal").show(600)
}

function welcome(name, id) {
    str = `Welcome, ${name}! Your ID is <span style="font-size: 2.9vh; vertical-align: baseline">${id}</span>`
    $("#your-id").html(str)
}

function receiveStream(call) {
    call.on('stream', (peerStream) => {
        peerVid = document.getElementById("right-video");
        peerVid.srcObject = peerStream;
        peerVid.onloadedmetadata = (e) => {
            peerVid.play()
        }
        $("#left-video-username").html(username)
        var peerName = call.metadata.username
        $("#right-video-username").html(peerName)
        $("#left-video-controls").show(300)
        $("#right-video-controls").show(300)
    })
}

function answerCall(call) {
    var peerName = call.metadata.username
    alert(`Incoming call from ${peerName}!`);
    $("#call-modal").hide(300);
    $("#video-container").show();
    $("#left-video-controls").hide()
    $("#right-video-controls").hide()
    console.log('call incoming!')
    navigator.mediaDevices.getUserMedia({
        audio: true, 
        video: {facingMode: 'user'}
    }).then((stream) => {
        vid = document.getElementById("left-video");
        vid.srcObject = stream;
        vid.onloadedmetadata = (e) => {
            vid.play()
        }
        console.log('sending stream')
        call.answer(stream, {
            metadata: { 'username': username }
        });
        receiveStream(call)
    })
}

function makePeer(id) {
    peer = new Peer(id, {
        debug: 2
    });
    console.log(peer);
    var delay = Promise.resolve()
    .then(() => {
        peer.on('call', (call) => {
            answerCall(call)
        })
    })
}

function firstFunctions() {
    getInfo();
    makePeer(peerID);
    welcome(username, peerID);
    $("#call-id").focus()
}

$("#username, #peer-id").on('keydown', (e) => {
    if (e.keyCode === 13) {
        firstFunctions()
    }
})


var call
function initCall(id) {
    navigator.mediaDevices.getUserMedia({
        audio: true, 
        video: {facingMode: 'user'}
    }).then((stream) => {
        vid = document.getElementById("left-video");
        vid.srcObject = stream;
        vid.onloadedmetadata = (e) => {
            vid.play()
        }
        call = peer.call(id, stream, {
            metadata: { 'username': username }
        })
        receiveStream(call)
    })
}

function connectionFunctions() {
    $("#call-modal").hide(300)
    $("#video-container").show()
    var callerID = $("#call-id").val()
    initCall(callerID)
}

$("#call-id").on('keydown', (e) => {
    if (e.keyCode === 13) {
        connectionFunctions()
    }
})
