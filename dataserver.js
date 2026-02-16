const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});
const { ExpressPeerServer } = require('peer');

// Set up PeerJS server
const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: '/'
});

// Middleware
app.use('/peerjs', peerServer);
app.use(express.static(__dirname));

// Routes
app.get('/', (req, res) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    res.sendFile(__dirname + '/index.html');
});

// Socket.io for Signaling
io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        // Alert others that a new user has joined
        socket.to(roomId).emit('user-connected', userId);
        
        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId);
        });
    });
});

// Port configuration for Render
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
