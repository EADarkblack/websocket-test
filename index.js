const WebSocket = require("ws");
const http = require("http");

const server = new WebSocket.Server({ noServer: true });

let clients = [];
let currentVersion = "";

server.on("connection", (socket) => {
  console.log("Client connected");
  clients.push(socket);

  socket.send(
    JSON.stringify({
      type: "WELCOME",
      message:
        "Welcome to the WebSocket server! Current Version: " + currentVersion,
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

// Función para notificar a los clientes sobre una nueva versión y reiniciar conexiones
const notifyClientsAboutNewVersion = (version) => {
  currentVersion = version;
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "NEW_VERSION", version }));
      client.close();
    }
  });
  clients = []; // Limpiar la lista de clientes
};

// Servidor HTTP para actualizar la versión
const httpServer = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/update-version") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const { version } = JSON.parse(body);
        if (version) {
          notifyClientsAboutNewVersion(version);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ status: "success", version }));
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ status: "error", message: "Version is required" })
          );
        }
      } catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "error", message: error.message }));
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "error", message: "Not Found" }));
  }
});

httpServer.on("upgrade", (request, socket, head) => {
  server.handleUpgrade(request, socket, head, (ws) => {
    server.emit("connection", ws, request);
  });
});

// Escucha en el puerto 8080 para WebSocket y HTTP
httpServer.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
