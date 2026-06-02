import { describe, expect, test } from "vitest";

import { handleCommand, shouldCloseConnection } from "../src/commands.js";

describe("handleCommand", () => {
    test("ECHO returns the argument", () => {
        expect(handleCommand("ECHO hello")).toBe("hello");
    });

    test("empty command returns an error", () => {
        expect(handleCommand("   ")).toBe("ERROR empty command");
    });

    test("unknown command returns an error", () => {
        expect(handleCommand("BOGUS hello")).toBe("ERROR unknown command: BOGUS");
    });

    test("QUIT returns goodbye", () => {
        expect(handleCommand("QUIT")).toBe("Goodbye.");
    });

    test("UPPER converts argument to uppercase", () => {
        expect(handleCommand("UPPER hello")).toBe("HELLO");
    });

    test("LOWER converts argument to lowercase", () => {
        expect(handleCommand("LOWER HELLO")).toBe("hello");
    });

    test("REVERSE reverses the argument", () => {
        expect(handleCommand("REVERSE hello")).toBe("olleh");
    });

    test("REVERSE with multiple words reverses the entire argument", () => {
        expect(handleCommand("REVERSE hello world")).toBe("dlrow olleh");
    });

    test("TIME returns a non-empty response", () => {
        const response = handleCommand("TIME");

        expect(typeof response).toBe("string");
        expect(response.length).toBeGreaterThan(0);
    });

    test("XREVERSE reverses each word in the argument", () => {
        expect(handleCommand("XREVERSE hello world")).toBe("olleh dlrow");
    });

    test("INSTRUCTIONS returns the list of available commands", () => {
        expect(handleCommand("INSTRUCTIONS")).toContain("Available commands:");
    });
});

describe("shouldCloseConnection", () => {
    test("QUIT closes the connection", () => {
        expect(shouldCloseConnection("QUIT")).toBe(true);
    });

    test("QUIT is case-insensitive", () => {
        expect(shouldCloseConnection("quit")).toBe(true);
    });

    test("non-QUIT command does not close the connection", () => {
        expect(shouldCloseConnection("ECHO hello")).toBe(false);
    });
});