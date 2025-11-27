
import { io } from "socket.io-client";

export const socket = io("http://192.168.100.187:5000", {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  timeout: 10000,
});

export const registerSupplier = (supplierId) => {
  if (socket) {
    socket.emit('registerSupplier', supplierId);
  }
};


export const registerTanker = (tankerId, supplierId) => {
  if (socket) {
    socket.emit('registerTanker', { tankerId, supplierId });
  }
};
export const registerUser = (userId, ) => {
  if (socket) {
    
    socket.emit('registerUser', userId);
  }
};


export const sendLocation = (data) => {
  if (socket) {
     console.log("Send location Data", data);
    socket.emit('sendLocation', data);
  }
};

export const onTankerLocation = (callback) => {
  if (socket) {
   
    
    socket.on('tankerLocation', (data) => {
    
      callback(data); 
    });
    
   
  } else {
    console.log(" Socket not connected for tankerLocation listener");
  }
};
export const sendTrackingStopped = (orderId, userId) => {
  console.log("🔍 Checking socket connection:", socket.connected);
  console.log("🔍 Socket ID:", socket.id);
  
  if (socket.connected) {
    socket.emit('trackingStopped', { orderId, userId });
    console.log("📡 Sent tracking stopped event for order:", orderId, "user:", userId);
  } else {
    console.log("❌ Socket not connected, cannot send tracking stopped");
    console.log("🔍 Socket state:", socket);
  }
};

export const onTrackingStopped = (callback) => {
  console.log("✅ Setting up trackingStopped listener");
  console.log("🔍 Socket available:", !!socket);
  console.log("🔍 Socket connected:", socket?.connected);
  
  if (socket && socket.connected) {
    socket.on('trackingStopped', callback);
    console.log("✅ Successfully set up trackingStopped listener");
  } else {
    console.log("❌ Socket not connected for trackingStopped listener");
  }
};

export const offTrackingStopped = () => {
  socket.off('trackingStopped');
};
