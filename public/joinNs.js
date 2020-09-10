function joinNs(endpoint) {
    if(nsSocket) {
        // check to see if nsSocket is actually socket
        nsSocket.close()
        // remove the EventListener before its add it again
        document.querySelector('#user-input').removeEventListener('submit',formSubmission)
    }
    nsSocket = io(`http://localhost:9000${endpoint}`);

    nsSocket.on('nsRoomLoad', nsRooms => {
        console.log('nsRooms',nsRooms);
        let roomList = document.querySelector('.room-list');
        roomList.innerHTML = "";
        nsRooms.forEach(room => {

            let glyph = room.privateRoom ? 'lock' : 'globe'
            roomList.innerHTML += `<li class="room"><span class="glyphicon glyphicon-${glyph}"></span>${room.roomTitle}</li>`

        })
        // add click listener for each room

        let roomNodes = document.getElementsByClassName('room');

        Array.from(roomNodes).forEach(elem => {
            elem.addEventListener('click', e => {
                joinRoom(e.target.innerText)
            })
        })

        // add room automatically
        const tapRoom = document.querySelector('.room')
        const topRoomName = tapRoom.innerText;
        // console.log('topRoomName',topRoomName);
        joinRoom(topRoomName)

    })
    nsSocket.on('messageToClients',(msg)=>{
        const newMsg = buildHtml(msg)
        
        document.querySelector('#messages').innerHTML += newMsg
    })

    document.querySelector('.message-form').addEventListener('submit',formSubmission)
}
function formSubmission(event) {
    
    event.preventDefault();
    const newMessage = document.querySelector('#user-message');
    nsSocket.emit('newMessageToServer',{text: newMessage.value})
    newMessage.value = '';
}


function buildHtml(msg) {
    const convertedDate = new Date(msg.time).toLocaleString()
    const newHtml = `
    <li>
        <div class="user-image">
            <img src="${msg.avatar}" />
        </div>
        <div class="user-message">
            <div class="user-name-time">${msg.username} <span>${convertedDate}</span></div>
            <div class="message-text">${msg.text}</div>
        </div>
    </li>`
    return newHtml
}