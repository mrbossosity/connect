# Connect
Dabbling in real-time web chatting through [Peer.js](https://peerjs.com/), a brilliant API which wraps WebRTC. Here lives a web app not unlike Zoom which hosts live video calls between peers. Now supports group meetings!

### PeerJS
The core of the Peer API is the `Peer` object, which brokers a secure connection between the browser and a remote server. Each user is assigned a `Peer` with a unique Peer ID when they log onto Connect. The `.connect(id)` and `.call(id, stream, metadata)` methods allow peers to remotely establish data and media connections with other peers on the server.

### Hosts
A random 6-digit "meeting ID" is automatically generated for each meeting. The host may assign a custom ID to their meeting if they wish. This "meeting ID" simply becomes the Peer ID of the host. Thus, guests join the "meeting" by calling the host's Peer ID. NOTE: The host is responsible for communicating their ID with whomever wishes to join the meeting. 

### Guests
Guests are prompted to give their peer a username. This username is separate from the peer's uniquely generated peer ID, and is communicated to the host as a string passed in the `metadata` argument of the `.call()` method. 

### Handling Calls
Upon joining a meeting, each guest peer sends a `MediaStream` object (captured from the front webcam) to the host via the `stream` argument of the `.call()` method:

    var call = peer.call(hostID, aUserStream, {
        metadata: { 'username': username }
    })

The host extracts the guest's username and sends its `MediaStream` in return upon answering the call: 
(simplified and abridged code)

    peer.on('call', (call) => {
        var peerName = call.metadata.username;
        alert(`${peerName} joined the meeting!`);
        call.answer(hostStream)
    })

The host also establishes a `DataConnection` with each guest:

    peer.on('call', (call) => {
        ...
        var guestID = call.peer //ID of guest who initiated the call
        var conn = peer.connect(guestID)
    })

At this point, the host is receiving each guest's stream, but each guest is receiving only their own stream and the stream of the host. This is no problem for one-on-one meetings, but what about...

*Group calls?*

PeerJS does not have a native method for handling group calls; **however, a peer can make and answer multiple one-on-one calls simultaneously**. The key to simulating a group call experience is notifying each already-connected guest when a new peer calls the host. This is why a `DataConnection` is established between the host and each guest. When a new guest calls the host, the host sends a message across the `DataConnection` to each already-connected-guest containing the unique Peer ID of the new guest. Upon receiving this message, each already-connected-guest calls the ID of the new guest, and the new guest answers each call. In this way, the host receives the stream of the new guest, the already-connected-guests send their streams to the new guest, and the new guest sends its stream in return to each already-connected-guest. 

### Text Chat 
We again use the `DataConnection` between host and guest to create a simple chat function. When a guest hits "Enter" in the chat input, a string is sent across the `DataConnection` to the host containing the peer's username and the text captured from the chat input.

    $("#chat-input").on('keyup', (e) => {
        if (e.keyCode === 13) {
            var text = $("#chat-input").val();
            conn.send(`${username}: ${text}`);
            $("#chat-input").val('')
        }
    })

The host sends this string to all connected peers across their respective `dataConnection`s (including the original sender), and each peer (including the host) renders the string as a paragraph element in their chatbox. 
