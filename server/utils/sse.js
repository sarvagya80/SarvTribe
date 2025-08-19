// src/utils/sse.js

// This object will hold all active client connections in memory
const clients = {};

// Function to add a new client
export const addClient = (userId, response) => {
    clients[userId] = response;
    console.log(`User ${userId} connected for SSE.`);
};

// Function to remove a client
export const removeClient = (userId) => {
    delete clients[userId];
    console.log(`User ${userId} disconnected from SSE.`);
};

// Function to send an event to a specific user
export const sendSseEvent = (userId, eventName, data) => {
    const client = clients[userId];
    if (client) {
        client.write(`event: ${eventName}\n`);
        client.write(`data: ${JSON.stringify(data)}\n\n`);
    }
};