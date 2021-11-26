# Real time

The server sends messages to clients via [Socket.io](https://socket.io/).
The socket has been secured to allow only authenticated users to receive data.

## Development
The custom implementation of socket.io server is located in `src\helpers\io-socket.ts` and is initialized in `src\app.ts`.

### Usage

```
import {ioSocket} from "../app";

...

const sentData = {}; // your data object

// Fire 'event-name' event to authenticated clients
ioSocket.emitAuthenticated('event-name', sentData); 

// Fire 'event-name' event to not authenticated clients; unauthenticated users
// will be disconnected 10 seconds after the connection request
ioSocket.emit('event-name', sentData);

```

## Client Guide

The client, after connecting to the socket, has **10 seconds** to authenticate: 
it must send to the server an `authentication` event with the `access_token` given.

- If authentication is **successful**, the client will receive the `authenticated` event and can then receive the events.
- If authentication **fails**, the client will receive the `unauthorized` event and will be disconnected.

### Example

[https://socket.io/docs/v4/client-api/](https://socket.io/docs/v4/client-api/)

```
import { io } from "socket.io-client";

...

const accessToken = ''; // string
const socket = io(ENDPOINT);

socket.emit("authentication", accessToken);

socket.on("authenticated", data => {
    // {status: 200, message: `Authentication success`}
});
    
socket.on("unauthorized", data => {
    // {status: 401, message: `Authentication failure socket {{socketId}}`}
    // {status: 403, message: `Access denied`}
    // {status: 500, message: `Internal server error`}
});

```

### Events
The events that the client can listen to are:
- `authenticated`: now can receive events other than `authenticated` and `unauthorized`
- `unauthorized`: disconnected
- `new-notification`: is fired when a new notification is created [Requires authentication]
- `updated-notification`: is fired when an unread notification is updated [Requires authentication]
