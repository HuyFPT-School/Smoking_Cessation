import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
  }

  connect(onConnected, onError) {
    if (this.connected) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.client = new Client({
        webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
        debug: (str) => {
          console.log("STOMP: " + str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: (frame) => {
          console.log("Connected: " + frame);
          this.connected = true;
          if (onConnected) onConnected();
          resolve();
        },
        onStompError: (frame) => {
          console.error("Broker reported error: " + frame.headers["message"]);
          console.error("Additional details: " + frame.body);
          this.connected = false;
          if (onError) onError(frame);
          reject(frame);
        },
        onWebSocketClose: () => {
          console.log("WebSocket connection closed");
          this.connected = false;
        },
      });

      this.client.activate();
    });
  }

  disconnect() {
    if (this.client && this.connected) {
      this.subscriptions.clear();
      this.client.deactivate();
      this.connected = false;
    }
  }

  subscribeToRoom(roomId, callback) {
    if (!this.connected) {
      console.error("WebSocket not connected");
      return null;
    }

    const destination = `/topic/room/${roomId}`;
    const subscription = this.client.subscribe(destination, (message) => {
      const messageData = JSON.parse(message.body);
      callback(messageData);
    });

    this.subscriptions.set(roomId, subscription);
    return subscription;
  }

  subscribeToUserNotifications(userId, callback) {
    if (!this.connected) {
      console.error("WebSocket not connected");
      return null;
    }

    const destination = `/topic/user/${userId}/notifications`;
    const subscription = this.client.subscribe(destination, (message) => {
      const messageData = JSON.parse(message.body);
      callback(messageData);
    });

    this.subscriptions.set(`notifications_${userId}`, subscription);
    return subscription;
  }

  subscribeToUserErrors(userId, callback) {
    if (!this.connected) {
      console.error("WebSocket not connected");
      return null;
    }

    const destination = `/topic/user/${userId}/errors`;
    const subscription = this.client.subscribe(destination, (message) => {
      const errorMessage = JSON.parse(message.body);
      callback(errorMessage);
    });

    this.subscriptions.set(`errors_${userId}`, subscription);
    return subscription;
  }

  unsubscribeFromRoom(roomId) {
    const subscription = this.subscriptions.get(roomId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(roomId);
    }
  }

  unsubscribeFromUserNotifications(userId) {
    const subscription = this.subscriptions.get(`notifications_${userId}`);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(`notifications_${userId}`);
    }
  }

  sendMessage(message) {
    if (!this.connected) {
      console.error("WebSocket not connected");
      return;
    }

    this.client.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify(message),
    });
  }

  joinRoom(roomId) {
    if (!this.connected) {
      console.error("WebSocket not connected");
      return;
    }

    this.client.publish({
      destination: "/app/chat.joinRoom",
      body: roomId,
    });
  }

  markAsRead(roomId, userId) {
    if (!this.connected) {
      console.error("WebSocket not connected");
      return;
    }

    this.client.publish({
      destination: "/app/chat.markAsRead",
      body: JSON.stringify({ roomId, receiverId: userId }),
    });
  }
}

export default new WebSocketService();
