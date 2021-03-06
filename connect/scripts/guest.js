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
    peerID = makeID()
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
            $("#audio-control").css('background-color', 'red');
            aEnabled = false
        } else {
            audioTracks.forEach(track => track.enabled = true);
            $("#audio-control").css('background-color', 'dodgerblue');
            aEnabled = true
        }
    } else if (e.altKey && e.keyCode === 86) {
        if (vEnabled) {
            videoTracks.forEach(track => track.enabled = false);
            $("#video-control").css('background-color', 'red');
            vEnabled = false
        } else {
            videoTracks.forEach(track => track.enabled = true);
            $("#video-control").css('background-color', 'darkorange');
            vEnabled = true
        }
    }
}

function resizeVids() {
    var vidWidth;
    if (0 < connectedPeers.length <= 2) {
        vidWidth = (100 / (connectedPeers.length + 1)) - (1 / connectedPeers.length);
    } 
    if (connectedPeers.length > 2 && (connectedPeers.length + 1) % 2 == 0) {
        vidWidth = ((100 / (connectedPeers.length + 1)) * 2) - ((1 / connectedPeers.length) * 2)
    }
    if (connectedPeers.length > 2 && (connectedPeers.length + 1) % 2 !== 0) {
        vidWidth = (100 / ((connectedPeers.length / 2) + 1)) - (1 / ((connectedPeers.length) / 2) + 1)
    }
    if (connectedPeers.length == 0) {
        console.log('no peers');
        vidWidth = 98
    }
    let width = `${vidWidth}%`;
    $(".video-holder").css('width', width)
    if (connectedPeers.length <= 2) {
        $(".video-holder").css('max-height', '100%')
    } else {
        $(".video-holder").css('max-height', '48.5%')
    }                                   
}

function initCall(id, myStream) {
    var call = peer.call(id, myStream, {
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

        resizeVids();

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
        try {calls.close(); console.log('call closed')} catch {};
        try {peer.disconnect(); console.log('peer disconnected')} catch {};
        try {peer.destroy(); console.log('peer destroyed')} catch{};
        alert(`Oops! Call broke. ${err}`);
        window.location.reload(true)
    })
}

function answerCall(call, myStream) {
    var peerName = call.metadata.username;

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
    
    var vidHTML = `<div class="video-holder"><video class="video-stream" id="${call.peer}" autoplay></video></div>`;
    $("#video-container").append(vidHTML);

    call.on('stream', (peerStream) => {
        var vid = document.getElementById(call.peer);
        vid.srcObject = peerStream;
        vid.onloadedmetadata = (e) => {
            vid.play()
        }

        resizeVids();

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
        try {calls.close(); console.log('call closed')} catch {};
        try {peer.disconnect(); console.log('peer disconnected')} catch {};
        try {peer.destroy(); console.log('peer destroyed')} catch{};
        alert(`Oops! Call broke. ${err}`);
        window.location.reload(true)
    })
}

var calls = [], myStream, connectedPeers = [];
async function getMyStream(peer) {
    myStream = await navigator.mediaDevices.getUserMedia({
        audio: {
            sampleSize: 16,
            sampleRate: {min: 22050, ideal: 32000, max: 48000}
        }, 
        video: {
            width: {min: 240, ideal: 720, max: 720 },
            height: {min: 180, ideal: 540, max: 720},
            frameRate: {min: 12, ideal: 24, max: 30},
            facingMode: 'user'
        }
    })
    var vid = document.getElementById("myVid")
    vid.srcObject = myStream;
    vid.onloadedmetadata = (e) => {
        vid.play()
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
            $(this).css('background-color', 'red');
            aEnabled = false
        } else {
            audioTracks.forEach(track => track.enabled = true);
            $(this).css('background-color', 'dodgerblue');
            aEnabled = true
        }
    })
    $("#video-control").click(() => {
        if (vEnabled) {
            videoTracks.forEach(track => track.enabled = false);
            $(this).css('background-color', 'red');
            vEnabled = false
        } else {
            videoTracks.forEach(track => track.enabled = true);
            $(this).css('background-color', 'darkorange');
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
            connectedPeers.push(call.peer)
            answerCall(call, myStream)
        })
    
        peer.on('connection', (conn) => {
            conn.on('open', () => {
                conn.on('data', (data) => {
                    var regExp2 = new RegExp(`${username}:`);
                    if ((/GOBBLEDYGOOK CALL THIS PEER:/).test(data)) {
                        var str = data;
                        newPeer = str.substr(28);
                        connectedPeers.push(newPeer);
                        initCall(newPeer, myStream);
                        console.log(`calling ${newPeer}...`)
                    } else if ((/APHANTASIA!:/).test(data)) {
                        var str = data;
                        var leftID = str.substr(12);
                        console.log(`will remove ${leftID} from DOM and connectedPeers`)
                        var connToRemove = connectedPeers.indexOf(leftID);
                        connectedPeers.splice(connToRemove, 1);
                        $(`${leftID}`).closest('div').remove();
                        resizeVids();
                    } else {
                        var msg = ((regExp2).test(data)) ? `<p class="out-chat-message">${data}</p>`:`<p class="in-chat-message">${data}</p>`
                        $("#chat-modal").append(msg);
                        if ($("#chat-modal").is(":hidden")) {
                            $("#chat-modal").show(200);
                        }
                        $("#chat-modal").scrollTop(1E8);
                    }
                });
                $("#chat-input").on('keyup', (e) => {
                    if (e.keyCode === 13) {
                        var text = $("#chat-input").val();
                        conn.send(`${username}: ${text}`);
                        $("#chat-input").val('')
                    }
                })
            })
            conn.on('close', () => {
                calls.forEach(call => call.close());
                alert('Meeting ended by host!');
                window.location.reload(true)
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
    connectedPeers.push(callerID)
    initCall(callerID, myStream)
}

$("#username").on('keydown', (e) => {
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
        alert('Left the meeting!');
        window.location.reload(true)
    } catch {
        window.location.reload(true)
    }
})

$("#chat-control").click(() => {
    if ($("#chat-modal").is(":visible")) {
        $("#chat-modal").hide(200);
    } else {
        $("#chat-modal").show(200);
        $("#chat-modal").scrollTop(1E8);
    }
})

$("#close-chat-modal").click(() => {
    $("#chat-modal").hide(300)
})