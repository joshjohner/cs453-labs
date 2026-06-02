import net from "node:net";
import readline from "node:readline";

// TCP host and port configuration
const HOST = process.env.HOST ?? "127.0.0.1";
const PORT = Number(process.env.PORT ?? 3000);

// Create TCP connection to server and handle connection events
const socket = net.createConnection({ host: HOST, port: PORT }, () => {
  console.log(`Connected to command server at ${HOST}:${PORT}`);
});

// Set socket encoding to match server encoding
socket.setEncoding("utf8");

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> "
});

// Handle response data from server
socket.on("data", (data) => {
  process.stdout.write(data);

  // If the readline interface is still open, prompt the user for input
  if (!rl.closed) {
    rl.prompt();
  }
});

// Handle server disconnection
socket.on("end", () => {
  console.log("Disconnected from server.");
  rl.close();
});

// Handle client errors
socket.on("error", (err) => {
  console.error("Client error:", err.message);
  rl.close();
});

// Handle user input
rl.on("line", (line) => {
  socket.write(`${line}\n`);

  // If the user entered the QUIT command, close the readline interface
  if (line.trim().toUpperCase() === "QUIT") {
    rl.close();
  }
});

// Handle readline interface close
rl.on("close", () => {
  if (!socket.destroyed) {
    socket.end();
  }
});
