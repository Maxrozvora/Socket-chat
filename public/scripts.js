// const socket = io('http://localhost:9000'); // the / namespace/endpoint
const username = prompt('What is your username?')
const socket = io('http://localhost:9000', {
    query: {
        username
    }
}); // the / namespace/endpoint

let nsSocket = '';

// listen for nsList, whitch is a list of all namespaces
socket.on('nsList', nsData => {
    console.log('nsData',nsData);
    let namespacesDiv = document.querySelector('.namespaces')
    namespacesDiv.innerHTML = '';
    nsData.forEach(data => {
        namespacesDiv.innerHTML += `<div class="namespace" ns=${data.endpoint}><img src="${data.img}"/></div>`
    })

    // Add clicklistnes for each namespace
    Array.from(document.getElementsByClassName('namespace')).forEach(element => {
        element.addEventListener('click', (e) => {
            const nsEndpoint = element.getAttribute('ns')
            joinNs(nsEndpoint)
        })
        
    })

    joinNs('/wiki')

})


