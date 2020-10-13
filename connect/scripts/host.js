var username, peerID

const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
function makeID() {
    var id = '', x = 0;
    while (x < 6) { 
        let digit = digits[Math.floor(Math.random() * digits.length)];
        id += digit;
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
    if ($("#username").val() !== '') {
        username = $("#username").val()
    } else {
        username = 'Anonymous User'
    }
    getID();
    console.log(`NAME: ${username}, ID: ${peerID}`);
}

function welcome(name, id) {
    $("#main-modal").hide(300);
    $("#call-modal").show(600);
    str = `Welcome, ${name}! Your meeting ID is <span style="font-size: 2.9vh; vertical-align: baseline">${id}</span>`;
    $("#your-id").html(str)
}

var aEnabled = true, vEnabled = true;
function disableAV(e, audioTracks, videoTracks) {
    if (e.altKey && e.keyCode === 65) {
        if (aEnabled) {
            audioTracks.forEach(track => track.enabled = false);
            aEnabled = false
        } else {
            audioTracks.forEach(track => track.enabled = true);
            aEnabled = true
        }
    } else if (e.altKey && e.keyCode === 86) {
        if (vEnabled) {
            videoTracks.forEach(track => track.enabled = false);
            vEnabled = false
        } else {
            videoTracks.forEach(track => track.enabled = true);
            vEnabled = true
        }
    }
}

function answerCall(call, myStream) {
    var peerName = call.metadata.username;
    alert(`${peerName} joined the meeting!`);

    if ($("#call-modal").is(":visible")) {
        $("#call-modal").hide(300);
        $("#video-container").show();
    }

    var myVid = document.getElementById("myVid")
    myVid.srcObject = myStream;
    myVid.onloadedmetadata = (e) => {
        myVid.play()
    }

    call.answer(myStream);

    var destID = call.peer;
    openDataConns.forEach(openConn => openConn.send(destID));
    var conn = peer.connect(destID);
    conn.on('open', () => {
        openDataConns.push(conn);
        console.log(`connected to peer ${destID}!`);
    })

    var vidHTML = `<div class="video-holder"><video class="video-stream" id="${call.peer}" autoplay></video></div>`;
    $("#video-container").append(vidHTML);

    call.on('stream', (peerStream) => {
        var vid = document.getElementById(call.peer);
        vid.srcObject = peerStream;
        vid.onloadedmetadata = (e) => {
            vid.play()
        }

        var vidWidth;
        if ((connectedPeers.length % 2) == 0) {
            vidWidth = (100 / (connectedPeers.length)) - (1 / connectedPeers.length);
        } else {
            vidWidth = (100 / ((connectedPeers.length + 1) / 2)) - (1 / connectedPeers.length);
        }
        if (connectedPeers.length == 1) {
            vidWidth = 49
        }
        let width = `${vidWidth}%`;
        $(".video-holder").css('width', width)
        if ((connectedPeers.length > 1)) {
            $(".video-holder").css('max-height', '48.5%')
        }

        $("#av-buttons").show(300);
        $("#banner").hide();
        $("#banner-orange").show();
    })
    call.on('close', () => {
        myStream.getTracks().forEach(track => track.stop());
        try {peer.disconnect(); console.log('peer disconnected')} catch {};
        try {peer.destroy(); console.log('peer destroyed')} catch{};
        window.location.reload(true)
    })
    call.on('error', (err) => {
        myStream.getTracks().forEach(track => track.stop());
        try {call.close(); console.log('call closed')} catch {};
        try {peer.disconnect(); console.log('peer disconnected')} catch {};
        try {peer.destroy(); console.log('peer destroyed')} catch{};
        try {openDataConns.forEach(conn => conn.close())} catch{};
        alert(`Oops! Call broke. ${err}`);
        window.location.reload(true)
    })
}

var myStream, connectedPeers = [], calls = [], openDataConns = [];
async function getMyStream(peer) {
    myStream = await navigator.mediaDevices.getUserMedia({
        audio: true, 
        video: {
            width: 720,
            height: 480,
            facingMode: 'user'
        }
    })

    aEnabled = true; vEnabled = true;
    var audioTracks = myStream.getAudioTracks();
    var videoTracks = myStream.getVideoTracks();
    $(document).on('keydown', (e) => {
        disableAV(e, audioTracks, videoTracks)
    })
    $("#audio-control").click(() => {
        if (aEnabled) {
            audioTracks.forEach(track => track.enabled = false);
            aEnabled = false
        } else {
            audioTracks.forEach(track => track.enabled = true);
            aEnabled = true
        }
    })
    $("#video-control").click(() => {
        if (vEnabled) {
            videoTracks.forEach(track => track.enabled = false);
            vEnabled = false
        } else {
            videoTracks.forEach(track => track.enabled = true);
            vEnabled = true
        }
    })
}

function makePeer(id) {
    peer = new Peer(id, {
        secure: true,
        host: "connect-peer-server.herokuapp.com",
        port: 443,
        debug: 2
    });
    console.log(peer);
    var delay = Promise.resolve()
    .then(() => {
        getMyStream(peer);
        peer.on('call', (call) => {
            calls.push(call);
            connectedPeers.push(call.peer);
            answerCall(call, myStream)
        })
        peer.on('error', (err) => {
            $("#banner").show();
            $("#banner-orange").hide();
            $("#call-modal").hide(300);
            $("#main-modal").show(600);
            $("#username").focus();
            try {peer.disconnect(); console.log('peer disconnected')} catch {};
            try {peer.destroy(); console.log('peer destroyed')} catch{};
            alert(`Oops! Something went wrong. Try again or refresh. ${err}`)
            
        })
    })
}

function firstFunctions() {
    try {
        getInfo();
        makePeer(peerID);
        welcome(username, peerID);
    } catch {
        alert('Oops! Something went wrong. Try again or refresh.')
    }
}

$("#username, #peer-id").on('keydown', (e) => {
    if (e.keyCode === 13) {
        firstFunctions()
    }
})

$("#banner-orange").on('click', () => {
    try {
        openDataConns.forEach(conn => conn.close());
        calls.forEach(call => call.close());
        alert('Call ended!');
    } catch {
        console.log('error closing call')
    }
})