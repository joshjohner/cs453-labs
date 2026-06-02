import net from "node:net";
import { handleCommand, shouldCloseConnection } from "./commands.js";

// TCP host and port configuration
const HOST = process.env.HOST ?? process.env.npm_package_config_host ?? "127.0.0.1";
const PORT = Number(process.env.PORT ?? process.env.npm_package_config_port ??  3000);

// Create TCP server
const server = net.createServer((socket) => {
  // Get client address including port
  const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;

  // Log client connection
  console.log(`Client connected: ${clientAddress}`);

  // Set socket encoding
  socket.setEncoding("utf8");

  // Display welcome message and instructions
  socket.write("Welcome to the CS453 command server.\n");
  socket.write(`${handleCommand("INSTRUCTIONS")}\n`);

  // Handle incoming data from client
  socket.on("data", (data) => {
    
    /*
    console.log("Simulating intense computation...");
    const end = Date.now() + 5000
    while (Date.now() < end) {
      // Busy-wait to simulate intense computation
    } 
    console.log("Finished intense computation simulation.");
    */

    
    // Split incoming data into lines
    const lines = data.split(/\r?\n/).filter((line) => line.length > 0);

    // Process each line
    for (const line of lines) {
      // Display received command
      console.log(`Received from ${clientAddress}: ${line}`);

      // Handle command and send response
      const response = handleCommand(line);
      socket.write(`${response}\n`);

      // Check if connection should be closed
      if (shouldCloseConnection(line)) {
        socket.end();
        return;
      }
    }
  });

  // Handle client disconnection
  socket.on("end", () => {
    console.log(`Client disconnected: ${clientAddress}`);
  });

  // Handle socket errors
  socket.on("error", (err) => {
    console.error(`Socket error from ${clientAddress}:`, err.message);
  });
});

// Handle server errors
server.on("error", (err) => {
  console.error("Server error:", err.message);
  process.exit(1);
});

// Start server
server.listen(PORT, HOST, () => {
  console.log(`Command server listening on ${HOST}:${PORT}`);
});