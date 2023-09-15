# protico-sdk-demo-dapp
Demo dapp for protico-sdk


## Run server locally
```
npm run dev
```
it will run on `localhost:5173`

## Example lobby
> `http://localhost:5173/lobby/0-1270691741`

the dapp will try to connect websocket to a `websocket server`, and enter a lobby called `0-1270691741`
(if you don't run a websocket server, you will be redirect to error page)

## Message send
In a lobby page, when you type message and send, it will send POST request to `backend server`. 

The `backend server` will then ask `websocket server` to broadcast the message in the lobby, and the dapp will receive the message and display on the browser.

## How to test
Mock the network request
