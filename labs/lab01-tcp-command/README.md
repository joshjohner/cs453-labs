# Lab 1 - TCP Command Server


## Basic Protocol

*** All requests must begin with a command from the *Command Protocol* below.**

*If the command requires an argument, that argument must be seperated from the command by a space*

1. The server accepts TCP client connections on a configurable port. The host and port are configurable in two ways, 
  a. Change the "config:host" or "config:port" in package.json,
  b. set it as an environment variable HOST and PORT 
2. The client must send one command at a time.


## Command Protocol
*Required arguments are denoted by {args}*
***Basic Commands**
1. `ECHO {args}` - Returns the argument exactly as it was suplied
2. `UPPER {args}` - Returns the argument with all characters converted to upper case
3. `LOWER {args}` - Returns the argument with all characters converted to lower case
4. `QUIT` - Closes the client connection.

***Graduate Commands**   
5. `REVERSE {args}` - Returns the reverse of a single or multi word string
6. `XREVERSE {args}` - Returns a multi word string respecting word order, but reversing each word
7. `TIME` - Returns the current system time
8. `INFORMATION` - Displays the prompt again

Commands are case-insensitive, but the command arguments should be handled as normal text.

| Client sends    | Server responds     |
| --------------- | ------------------- |
| `ECHO hello`    | `hello`             |
| `UPPER hello`   | `HELLO`             |
| `LOWER HELLO`   | `hello`             |
| `REVERSE hello` | `olleh`             |
| `TIME`          | current server time |
| `QUIT`          | closes connection   |
| unknown command | error message       |

## Running the Lab

First, move into the starter directory:

```
cd labs/lab01-tcp-command/starter
```

Install dependencies:

```
npm install
```

Start the server:

```
npm run server
```

In a second terminal, move into the same starter directory and run the client:

```
npm run client
```

## Testing
Run the tests from the starter directory:

```
npm test
```

## Reflection Questions

Answer the following questions in your submission:

1. What is the difference between the client and the server?
 - The server creates the socket and sends it as a request to the server. The server responds to the request.
2. Why does the server need to keep running after handling one request?
 - So that it can respond to additional requests. 
3. What happens if two clients connect at the same time?
 - Each client is assigned a different port (socket). The server can respond to one at a time. I created a test where the server loops for 5 seconds when it receives the request before it starts processing.
 - I sent two requests from two different clients and it serves the first request exactly as you would expect. Then as soon as that request is finished, it serves the second request. As far as connecting at the exact same 
 - time, it would seem to me that the server is in fact capable of asyncronous handling so two connecting at the same time should not cause an issue. 
4. How is this different from HTTP?
 - The concurrent connections doesn't seem to be much different from HTTP, however, HTTP is built on top of TCP, so an HTTP connection must do everything a TCP connection does, plus parse the additional information
 - (headers, authorization etc.)
 


