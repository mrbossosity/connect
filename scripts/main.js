$("#banner-button").hide()
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
    $("#main-modal").hide(300)
}

$("#banner-button").click(() => {
    getInfo();
    var peer = new Peer(peerID, {
        debug: 2
    });
    console.log(peer)
})

//TODO: initiate a connection, start sending mediastream

//TODO: Change the page layout accordingly to host two videostreams