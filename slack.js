const express = require('express');
const app = express();
const socketio = require('socket.io')

let namespaces = require('./data/namespaces')

app.use(express.static(__dirname + '/public'));

const expressServer = app.listen(9000);
const io = socketio(expressServer);



// io.on = io.of('/').on
io.on('connection',(socket)=>{
    // console.log('socket.handshake',socket.handshake)
    // build an array to send back with the img and endpoint for each manespace NS
    let nsData = namespaces.map(ns => {
        return {
            img: ns.img,
            endpoint: ns.endpoint
        }
    })

    // send the nsData back to the client. We need to use NOT socket,
    //  because we want it to go just this client.
    socket.emit('nsList', nsData)
})
console.log('namespaces',namespaces);
namespaces.forEach(namespace => {
    // console.log('namespace.endpoint',namespace.endpoint);
    io.of(namespace.endpoint).on('connection', (nsSocket) => {
        const username = nsSocket.handshake.query.username;
        // console.log(`${nsSocket.id} has join ${namespace.endpoint}`);
        // a socket has connected to one of out ns.
        // send that ns group info back
        nsSocket.emit('nsRoomLoad', namespace.rooms)
        nsSocket.on('joinRoom', (roomToJoin, numberOfusersCallback) => {
            // deal with history once we have it
            nsSocket.join(roomToJoin)
            const roomToLeave = Object.keys(nsSocket.rooms)[1];
            updateUsersInRoom(namespace, roomToLeave);
            nsSocket.leave(roomToLeave);
            console.log('nsSocket',nsSocket.rooms);
            // io.of(namespace.endpoint).in(roomToJoin).clients((error, client) => {
            //     console.log(client.length);
            //     numberOfusersCallback(client.length)
            // })
            const nsRoom = namespace.rooms.find(room => {
                return room.roomTitle === roomToJoin
            })
            // console.log('nsRoom there',nsRoom);
            nsSocket.emit('historyCatchUp', nsRoom.history)

            updateUsersInRoom(namespace, roomToJoin);
            
        })
        nsSocket.on('newMessageToServer', msg => {
            const fullMsg = {
                text: msg.text,
                time: Date.now(),
                username,
                avatar: 'https://via.placeholder.com/30'
            }
            console.log(fullMsg)
            // send this message to all the sockets in the room
            console.log(nsSocket.rooms);
            // the User will be in the 2nd room in oblect
            // get the key socket
            const roomTitle = Object.keys(nsSocket.rooms)[1];
            // we need to find the Room object for this room
            const nsRoom = namespace.rooms.find(room => {
                return room.roomTitle === roomTitle
            })
            // console.log('nsRoom',nsRoom);
            nsRoom.addMessage(fullMsg)
            io.of(namespace.endpoint).to(roomTitle).emit('messageToClients', fullMsg)
        })
    })
})

function updateUsersInRoom(namespace, roomToJoin) {
    // Send back the number of users in this room to All sockects connected to this room
    io.of(namespace.endpoint).in(roomToJoin).clients((error,clients) => {
        io.of(namespace.endpoint).in(roomToJoin).emit('updateMembers', clients.length)
    })
}