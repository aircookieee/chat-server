import auth from "./auth.json" with { type: "json" };

class wsLoginMessage {
  type: string;
  username: string;
  password: string;
  constructor(type: string, username: string, password: string) {
      this.type = type; 
      this.username = username;
      this.password = password;   // please hash the password thanks
    }
}
class wsMessage {
  type: string;
  data: string;
  constructor(type: string, data: string) {
      this.type = type;
      this.data = data;
  }
}

function verifyPassword(inputHash: string, storedHash: string): boolean {
  console.log(inputHash + "   " + storedHash);
  return inputHash === storedHash;
}

let onlineUsers = []

Deno.serve({
    port: 8010,
    handler: (request) => {
      if (request.headers.get("upgrade") === "websocket") {
        const { socket, response } = Deno.upgradeWebSocket(request);
  
        socket.onopen = () => {
          console.log("CONNECTED");
          console.log(socket.readyState);
          socket.send("Welcome!")
        };
        socket.onmessage = async (event) => {
          console.log(`RECEIVED: ${event.data}`);
          const message = JSON.parse(event.data);
          console.log(message.type)
          if (message.type == "login") {
              const loginMessage: wsLoginMessage = message;
              const passwordIsValid = verifyPassword(loginMessage.password, auth.keys.default)
              console.log(JSON.stringify(new wsMessage("loginResponse", String(passwordIsValid))));
              socket.send(JSON.stringify(new wsMessage("loginResponse", String(passwordIsValid))))

          }
        };
        socket.onclose = () => console.log("Client Disconnected");
        socket.onerror = (error) => console.error("ERROR:", error);
  
        return response;
      } else {
        return new Response("", {status: 400});
      }
    },
  });
  
