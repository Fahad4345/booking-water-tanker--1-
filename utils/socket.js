// utils/socket.js
import { io } from "socket.io-client";

// ⚠️ Replace with your backend local IP address
// (Find it by running `ipconfig` or `ifconfig` — something like 192.168.x.x)
export const socket = io("http://192.168.100.187:5000", {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  timeout: 10000,
});
