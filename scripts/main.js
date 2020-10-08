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
}

function welcome(name, id) {
    $("#main-modal").hide(300);
    $("#call-modal").show(600)
    str = `Welcome, ${name}! Your ID is <span style="font-size: 2.9vh; vertical-align: baseline">${id}</span>`
    $("#your-id").html(str)
}

var aEnabled = true, vEnabled = true;
function disableAV(e, audioTracks, videoTracks) {
    if (e.altKey && e.keyCode === 65) {
        if (Boolean(aEnabled)) {
            audioTracks.forEach(track => track.enabled = false)
            aEnabled = false
        } else {
            audioTracks.forEach(track => track.enabled = true)
            aEnabled = true
        }
    } else if (e.altKey && e.keyCode === 86) {
        if (Boolean(vEnabled)) {
            videoTracks.forEach(track => track.enabled = false)
            vEnabled = false
        } else {
            videoTracks.forEach(track => track.enabled = true)
            vEnabled = true
        }
    }
}

function answerCall(call) {
    var peerName = call.metadata.username
    alert(`Incoming call from ${peerName}!`);
    $("#call-modal").hide(300);
    $("#video-container").show();
    $("#left-video-controls").hide()
    $("#right-video-controls").hide()
    navigator.mediaDevices.getUserMedia({
        audio: true, 
        video: {
            width: 720,
            height: 480,
            facingMode: 'user'
        }
    }).then((stream) => {
        vid = document.getElementById("left-video");
        vid.srcObject = stream;
        vid.onloadedmetadata = (e) => {
            vid.play()
        }

        var audioTracks = stream.getAudioTracks();
        var videoTracks = stream.getVideoTracks();
        $(document).on('keydown', (e) => {
            disableAV(e, audioTracks, videoTracks)
        })
        $("#audio-control").click(() => {
            if (Boolean(aEnabled)) {
                audioTracks.forEach(track => track.enabled = false)
                aEnabled = false
            } else {
                audioTracks.forEach(track => track.enabled = true)
                aEnabled = true
            }
        })
        $("#video-control").click(() => {
            if (Boolean(vEnabled)) {
                videoTracks.forEach(track => track.enabled = false)
                vEnabled = false
            } else {
                videoTracks.forEach(track => track.enabled = true)
                vEnabled = true
            }
        })

        call.answer(stream, {
            metadata: { 'username': username }
        });

        call.on('stream', (peerStream) => {
            peerVid = document.getElementById("right-video");
            peerVid.srcObject = peerStream;
            peerVid.onloadedmetadata = (e) => {
                peerVid.play()
            }
            $("#left-video-username").html(username);
            $("#right-video-username").html(peerName);
            $("#left-video-controls").show(300);
            $("#right-video-controls").show(300);
            $("#av-buttons").show(300);
            $("#banner-orange").on('click', () => {
                try {
                    call.close()
                } catch {
                    console.log('error closing call')
                }
            }).prop('disabled', false)
            $("#banner").hide();
            $("#banner-orange").show();
        })
        call.on('close', () => {
            stream.getTracks().forEach(track => track.stop());
            try {peer.disconnect(); console.log('peer disconnected')} catch {};
            try {peer.destroy(); console.log('peer destroyed')} catch{};
            $("#banner").show();
            $("#banner-orange").hide();
            $("#video-container").hide();
            $("#av-buttons").hide();
            $("#main-modal").show(600);
            $("#username").focus();
            alert('Call ended!')
        })
        call.on('error', (err) => {
            stream.getTracks().forEach(track => track.stop());
            try {call.close(); console.log('call closed')} catch {};
            try {peer.disconnect(); console.log('peer disconnected')} catch {};
            try {peer.destroy(); console.log('peer destroyed')} catch{};
            $("#banner").show();
            $("#banner-orange").hide();
            $("#video-container").hide();
            $("#av-buttons").hide();
            $("#main-modal").show(600);
            $("#username").focus();
            alert(`Oops! Something went wrong. Try again or refresh. ${err}`)
        })
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
        peer.on('error', (err) => {
            $("#banner").show();
            $("#banner-orange").hide();
            $("#call-modal").hide(300);
            $("#main-modal").show(600);
            $("#username").focus();
            try {peer.disconnect(); console.log('disconnected')} catch {};
            try {peer.destroy(); console.log('destroyed')} catch{};
            alert(`Oops! Something went wrong. Try again or refresh. ${err}`)
        })
    })
}

var call
function initCall(id) {
    navigator.mediaDevices.getUserMedia({
        audio: true, 
        video: {
            width: 720,
            height: 480,
            facingMode: 'user'
        }
    }).then((stream) => {
        vid = document.getElementById("left-video");
        vid.srcObject = stream;
        vid.onloadedmetadata = (e) => {
            vid.play()
        }

        var audioTracks = stream.getAudioTracks();
        var videoTracks = stream.getVideoTracks();
        $(document).on('keydown', (e) => {
            disableAV(e, audioTracks, videoTracks)
        })
        $("#audio-control").click(() => {
            if (Boolean(aEnabled)) {
                audioTracks.forEach(track => track.enabled = false)
                aEnabled = false
            } else {
                audioTracks.forEach(track => track.enabled = true)
                aEnabled = true
            }
        })
        $("#video-control").click(() => {
            if (Boolean(vEnabled)) {
                videoTracks.forEach(track => track.enabled = false)
                vEnabled = false
            } else {
                videoTracks.forEach(track => track.enabled = true)
                vEnabled = true
            }
        })

        call = peer.call(id, stream, {
            metadata: { 'username': username }
        })

        call.on('stream', (peerStream) => {
            peerVid = document.getElementById("right-video");
            peerVid.srcObject = peerStream;
            peerVid.onloadedmetadata = (e) => {
                peerVid.play()
            }
            $("#left-video-username").html(username);
            var peerName = call.metadata.username;
            $("#right-video-username").html(peerName);
            $("#left-video-controls").show(300);
            $("#right-video-controls").show(300);
            $("#av-buttons").show(300);
            $("#banner-orange").on('click', () => {
                try {
                    call.close()
                } catch {
                    console.log('error closing call')
                }
            }).prop('disabled', false)
            $("#banner").hide();
            $("#banner-orange").show();
        })
        call.on('error', (err) => {
            stream.getTracks().forEach(track => track.stop());
            try {call.close(); console.log('call closed')} catch {};
            try {peer.disconnect(); console.log('peer disconnected')} catch {};
            try {peer.destroy(); console.log('peer destroyed')} catch{};
            $("#banner").show();
            $("#banner-orange").hide();
            $("#video-container").hide();
            $("#av-buttons").hide();
            $("#main-modal").show(600);
            $("#username").focus();
            alert(`Oops! Something went wrong. Try again or refresh. ${err}`)
        })
        call.on('close', () => {
            stream.getTracks().forEach(track => track.stop());
            try {peer.disconnect(); console.log('peer disconnected')} catch {};
            try {peer.destroy(); console.log('peer destroyed')} catch{};
            $("#banner").show();
            $("#banner-orange").hide();
            $("#video-container").hide();
            $("#av-buttons").hide();
            $("#main-modal").show(600);
            $("#username").focus();
            alert('Call ended!')
        })
    })
}

function firstFunctions() {
    try {
        getInfo();
        makePeer(peerID);
        welcome(username, peerID);
        $("#call-id").focus()
    } catch {
        alert('Oops! Something went wrong. Try again or refresh.')
    }
}

function connectionFunctions() {
    $("#call-modal").hide(300)
    $("#left-video-controls").hide()
    $("#right-video-controls").hide()
    $("#video-container").show()
    var callerID = $("#call-id").val()
    initCall(callerID)
}

$("#username, #peer-id").on('keydown', (e) => {
    if (e.keyCode === 13) {
        firstFunctions()
    }
})

$("#call-id").on('keydown', (e) => {
    if (e.keyCode === 13) {
        connectionFunctions()
    }
})
