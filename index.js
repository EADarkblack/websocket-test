// En tu servidor WebSocket

const WebSocket = require("ws");
const server = new WebSocket.Server({ port: 8080 });

let clients = [];

let currentVersion = "";

server.on("connection", (socket) => {
  console.log("Client connected");
  clients.push(socket);

  socket.send(
    JSON.stringify({
      type: "WELCOME",
      message: "Welcome to the WebSocket server! Current Version: " + currentVersion,
      version: currentVersion,
    })
  );

  socket.on("message", (message) => {
    console.log(`Received message => ${message}`);
  });

  socket.on("close", () => {
    console.log("Client disconnected");
    clients = clients.filter((client) => client !== socket);
  });
});

// Función para notificar a los clientes sobre una nueva versión
const notifyClientsAboutNewVersion = (version) => {
  currentVersion = version;
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "NEW_VERSION", version }));
    }
  });
};

// Ejemplo: Notificar a los clientes sobre una nueva versión (esto sería desencadenado por tu proceso de implementación)
setTimeout(() => {
  notifyClientsAboutNewVersion("1.0.55");
}, 5000); // Simula una nueva versión después de 20 segundos para pruebas
