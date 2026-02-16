const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {
    cors: { origin: "*" } // Allows phone to connect to PC without security blocks
});
const { ExpressPeerServer } = require('peer');

// PeerJS Server
const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: '/'
});

app.use('/peerjs', peerServer);
app.use(express.static(__dirname));

// Important: This helps bypass the ngrok "Welcome" screen
app.get('/', (req, res) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);
        
        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId);
        });
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is LIVE on port ${PORT}`);
});
