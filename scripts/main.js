$("#banner-button").hide()
$("#call-modal").hide()
$("#video-container").hide()
var connectButton = 'hidden'
function showButton() {
    if (connectButton == 'hidden') {
        $("#banner-button").show();
        connectButton = 'shown';
        $("#banner").hide()
    } 
}
$("#username").keydown(() => {
    showButton()
})

//TODO: Get text input, assign username metadata? and peer ID
var peer, username, peerID

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

function firstFunctions() {
    getInfo();
    peer = new Peer(peerID, {
        debug: 2
    });
    console.log(peer);
    welcome(username, peerID)
}

$("#username, #peer-id").on('keydown', (e) => {
    if (e.keyCode === 13) {
        firstFunctions()
    }
})


//TODO: initiate a connection, start sending mediastream

function initConn(id) {
    navigator.mediaDevices.getUserMedia({
        audio: true, 
        video: true
    }).then(function(stream) {
        vid = document.getElementById("left-video");
        vid.srcObject = stream;
        vid.onloadedmetadata = (e) => {
            vid.play()
        }
        peer.call(id, stream)
    })
}

function connectionFunctions() {
    $("#call-modal").hide(300)
    $("#video-container").show()
    var callerID = $("#call-id").val()
    initConn(callerID)
}
$("#call-id").on('keydown', (e) => {
    if (e.keyCode === 13) {
        connectionFunctions()
    }
})


//TODO: receive a call
//TODO: Change the page layout accordingly to host two videostreams