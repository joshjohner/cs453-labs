
// Command handling function for the TCP command server
export function handleCommand(line) {
    // Clean leading and trailing whitespace
    const trimmed = line.trim();

    // Check for empty command
    if (trimmed.length === 0) {
        return "ERROR empty command";
    }

    // Split command and arguments
    const [command, ...parts] = trimmed.split(" ");
    const argument = parts.join(" ");

    // Handle commands
    switch (command.toUpperCase()) {
        case "ECHO":
            return argument;

        case "UPPER":
            return argument.toUpperCase();

        case "LOWER":
            return argument.toLowerCase();

        // Reverse each word in the argument
        case "XREVERSE":
            const words = argument.split(" ");
            words.forEach((word, index) => {
                words[index] = word.split("").reverse().join("");
            });
            return words.join(" ");

        // Reverse the entire argument
        case "REVERSE":
            return argument.split("").reverse().join("");

        case "TIME":
            return new Date().toString();

        case "QUIT":
            return "Goodbye.";

        case "INSTRUCTIONS":
            return "Available commands: ECHO, UPPER, LOWER, REVERSE, XREVERSE, TIME, QUIT, INSTRUCTIONS";

        default:
            return `ERROR unknown command: ${command}`;
    }
}

// Function to determine if the connection should be closed
export function shouldCloseConnection(line) {
    return line.trim().toUpperCase() === "QUIT";
}