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
    str = `Welcome, ${name}! Your ID is <span style="font-size: 2.9vh; vertical-align: baseline">${id}</span>`;
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

function initCall(id, stream) {
    aEnabled = true; vEnabled = true;
    var audioTracks = stream.getAudioTracks();
    var videoTracks = stream.getVideoTracks();
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

    var call = peer.call(id, stream, {
        metadata: { 'username': username }
    })

    var vidHTML = `<div class="video-holder"><video class="video-stream" id="${id}" autoplay></video></div>`;
    $("#video-container").append(vidHTML);

    call.on('stream', (peerStream) => {
        calls.push(call);
        var vid = document.getElementById(id);
        vid.srcObject = peerStream;
        vid.onloadedmetadata = (e) => {
            vid.play()
        }

        var vidWidth
        if (calls.length < 2) {
            vidWidth = (100 / (calls.length + 2)) - (1 / calls.length);
            let width = `${vidWidth}%`;
            $(".video-holder").css('width', width)
        } else if (connectedPeers.length == 2) {
            $(".video-holder").css('width', '45%');
            $(".video-holder").css('max-height', '45%')
        }

        $("#av-buttons").show(300);
        $("#banner").hide();
        $("#banner-orange").show();
    })
    call.on('close', () => {
        stream.getTracks().forEach(track => track.stop());
        try {peer.disconnect(); console.log('peer disconnected')} catch {};
        try {peer.destroy(); console.log('peer destroyed')} catch{};
    })
    call.on('error', (err) => {
        stream.getTracks().forEach(track => track.stop());
        try {calls.close(); console.log('call closed')} catch {};
        try {peer.disconnect(); console.log('peer disconnected')} catch {};
        try {peer.destroy(); console.log('peer destroyed')} catch{};
        alert(`Oops! Call broke. ${err}`);
        window.location.reload(true)
    })
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

    call.answer(myStream);
    
    var vidHTML = `<div class="video-holder"><video class="video-stream" id="${call.peer}" autoplay></video></div>`;
    $("#video-container").append(vidHTML);

    call.on('stream', (peerStream) => {
        var vid = document.getElementById(call.peer);
        vid.srcObject = peerStream;
        vid.onloadedmetadata = (e) => {
            vid.play()
        }

        var vidWidth
        if (connectedPeers.length < 2) {
            vidWidth = (100 / (connectedPeers.length + 2)) - (1 / connectedPeers.length);
            let width = `${vidWidth}%`;
            $(".video-holder").css('width', width)
        } else if (connectedPeers.length == 2) {
            $(".video-holder").css('width', '45%');
            $(".video-holder").css('max-height', '45%')
        }

        $("#av-buttons").show(300);
        $("#banner").hide();
        $("#banner-orange").show();
    })
    call.on('close', () => {
        myStream.getTracks().forEach(track => track.stop());
        try {peer.disconnect(); console.log('peer disconnected')} catch {};
        try {peer.destroy(); console.log('peer destroyed')} catch{};
    })
    call.on('error', (err) => {
        myStream.getTracks().forEach(track => track.stop());
        try {call.close(); console.log('call closed')} catch {};
        try {peer.disconnect(); console.log('peer disconnected')} catch {};
        try {peer.destroy(); console.log('peer destroyed')} catch{};
        alert(`Oops! Call broke. ${err}`);
        window.location.reload(true)
    })
}

var calls = [], myStream, connectedPeers = [];
async function getMyStream(peer) {
    myStream = await navigator.mediaDevices.getUserMedia({
        audio: true, 
        video: {
            width: 720,
            height: 480,
            facingMode: 'user'
        }
    })
    var vid = document.getElementById("myVid")
    vid.srcObject = myStream;
    vid.onloadedmetadata = (e) => {
        vid.play()
    }
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
            calls.push(call)
            console.log(connectedPeers, calls)
            answerCall(call, myStream)
        })
    
        peer.on('connection', (conn) => {
            conn.on('open', () => {
                console.log('Received data connection!')
                conn.on('data', (data) => {
                    for (an_id in data) {
                        if (an_id !== peerID) {
                            console.log(`must call ${an_id}`);
                            var newPeer = data;
                            connectedPeers.push(newPeer);
                            console.log(newPeer);
                            initCall(newPeer, myStream)
                            conn.close()
                        }
                    }
                });
            })
        })

        peer.on('error', (err) => {
            $("#banner").show();
            $("#banner-orange").hide();
            $("#call-modal").hide(300);
            $("#main-modal").show(600);
            $("#username").focus();
            try {peer.disconnect(); console.log('peer disconnected')} catch {};
            try {peer.destroy(); console.log('peer destroyed')} catch{};
            alert(`Oops! Something went wrong. Try again or refresh. ${err}`);
            window.location.reload(true)
            
        })
    })
}

function firstFunctions() {
    try {
        getInfo();
        makePeer(peerID);
        welcome(username, peerID);
        $("#mtg-id").focus()
    } catch {
        alert('Oops! Something went wrong. Try again or refresh.')
    }
}

function connectionFunctions() {
    $("#call-modal").hide(300);
    $("#video-container").show();
    var callerID = $("#mtg-id").val();
    initCall(callerID, myStream)
}

$("#username, #peer-id").on('keydown', (e) => {
    if (e.keyCode === 13) {
        firstFunctions()
    }
})

$("#mtg-id").on('keydown', (e) => {
    if (e.keyCode === 13) {
        connectionFunctions()
    }
})

$("#banner-orange").on('click', () => {
    try {
        calls.forEach(call => call.close());
        alert('Call ended!');
        window.location.reload(true)
    } catch {
        console.log('error closing call')
    }
})