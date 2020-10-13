# Connect
Dabbling in real-time web chatting through [Peer.js](https://peerjs.com/), a brilliant API which wraps WebRTC. Here lives a web app not unlike Zoom which hosts live video calls between peers. Now supports group meetings!

## PeerJS
The core of the Peer API is the `Peer` object, which brokers a secure connection between the browser and a remote server. Each user is assigned a `Peer` with a unique Peer ID when they log onto Connect. The `.call(id, stream, metadata)` and `.connect(id)` methods allow peers to remotely establish media and data connections with other peers on the server.

## Hosts
A random 6-digit "meeting ID" is automatically generated for each meeting. The host may assign a custom ID to their meeting if they wish. This "meeting ID" simply becomes the unique peer ID of the host--thus, guests join the "meeting" by calling the ID of the host. NOTE: The host is responsible for communicating this ID with whomever wishes to join the meeting. 

## Guests
Guests are prompted to give their peer a username. This username is separate from the peer's randomly generated ID, and is communicated to the host as metadata passed in the `metadata` argument of the `.call()` method. 

## Handling Calls
Upon joining a meeting, each guest peer sends a `MediaStream` object (captured from the front webcam) to the host via the `stream` argument of the `.call()` method. The host sends its `MediaStream` in return upon answering the call. The host also establishes a `DataConnection` with each guest. At this point, the host is handling and receiving each guest's call and stream, but the guests are only in a call with and can only see the stream of the host.

*Multiple guests?*

PeerJS does not have a native method for handling calls between more than two peers; however, one peer may simultaneously call multiple peers. The key to handling multiple guests is notifying each guest in the meeting when a new peer calls the host. This is why a `DataConnection` is established between the host and each guest. When a new guest calls the host, the host sends a message across the `DataConnection` to each already-connected-guest containing the unique Peer ID of the new guest. Upon receiving this message, each already-connected-guest calls the ID of the new guest, and the new guest answers each call. In this way, the host receives the stream of the new guest, the already-connected-guests send their streams to the new guest, and the new guest sends its stream in return to ech already-connected-guest. 
