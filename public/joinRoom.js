function joinRoom(roomName){
    // Send this. room name to server
    nsSocket.emit('joinRoom', roomName, (nuberOfUsers) => {
        // we want to update the room member total
        document.querySelector('.curr-room-num-users').innerHTML = `${nuberOfUsers} <span class="glyphicon glyphicon-user"></span>`
    })
    nsSocket.on('historyCatchUp', history => {
        // console.log('history',history);
        const messageUl = document.querySelector('#messages');
        messageUl.innerHTML = '';
        history.forEach((msg)=>{
            const newMsg = buildHTML(msg)
            messageUl.innerHTML += newMsg;
        })
        messageUl.scrollTo(0,messageUl.scrollHeight)
    })

    nsSocket.on('updateMembers', nuberOfUsers => {
        document.querySelector('.curr-room-num-users').innerHTML = `${nuberOfUsers} <span class="glyphicon glyphicon-user"></span>`
        document.querySelector('.curr-room-text').innerText = `${roomName}`

    })

    let searchBox = document.querySelector('#search-box')
    searchBox.addEventListener('input', e => {
        e.target.value
        let messages = Array.from(document.getElementsByClassName('message-text'))
        messages.forEach(message => {
            if(message.innerText.indexOf(e.target.value) === -1) {
                message.style.display = "none"
            } else {
                message.style.display = "block"
            }
        })
    })
};