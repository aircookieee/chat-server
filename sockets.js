class wsLoginMessage {
    constructor(type, username, password) {
        this.type = type; 
        this.username = username;
        this.password = password;   // please hash the password thanks
      }
}
class wsMessage {
    constructor(type, data) {
        this.type = type;
        this.data = data;
    }
}

const wsUri = "ws://localhost:8010/";
const output = document.querySelector("#output");
const websocket = new WebSocket(wsUri);

async function login() {
    const loginUser = document.getElementById("username").value;
    console.log(document.getElementById("password").value);
    const loginPassword = await hashPassword(document.getElementById("password").value);
    const authMessage = new wsLoginMessage("login", loginUser, loginPassword)
    sendMessage(JSON.stringify(authMessage));
    const isLoggedIn = await new Promise((resolve) => {
        websocket.onmessage = (event) => {
            console.log(event.data);
            const message = JSON.parse(event.data);
            if (message.type === "loginResponse") {
                resolve(message.data === "true");
            }
        };
    });
    if (!isLoggedIn) return;
    document.getElementById("login").style.display = "none";
    document.getElementById("chat").style.display = "block";
    document.getElementById("currentUser").innerText = username;
}

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
}


function sendMessage(message) {
  console.log(`SENT: ${message}`);
  websocket.binaryType = "string"
  websocket.send(message);
}

websocket.onopen = (e) => {
  writeToScreen("CONNECTED");
};

websocket.onclose = (e) => {
  writeToScreen("DISCONNECTED");
};

websocket.onerror = (e) => {
  writeToScreen(`ERROR: ${e.data}`);
};
