const WebSocket = require("ws");
let wss = null;

const startWebSocketServer = (server) => {
    try{
        wss = new WebSocket.Server({ server });
        console.log("WebSocket Notification Server Started...");

        wss.on("connection", async (ws, req) => {
            const userId = parseInt(req.url.split("userId=")[1]) || null;

            if (!userId) {
                ws.close();
            }
            else {
                wss.clients.forEach((client) => {
                    if (client === ws && client.readyState === WebSocket.OPEN) {
                        client.userId = userId;
                    }
                });
                console.log([...wss.clients].length + " clients connected")
            }
        });
    }

    catch (error) {
        console.log("Error starting WebSocket Notification Server:", error);
    }
};



const sendWebSocketNotification = (type, userId, title, body, icon) => {
    try {
        return new Promise(async (resolve) => {
            if (!wss) {
                console.log("WebSocket Server not initialized");
                return resolve(false);
            }

            const user = [...wss.clients].find((client) => {
                return client.userId === userId && client.readyState === WebSocket.OPEN;
            });
    
            if (!user) {
                return resolve(false);
            }

            const payload = {};
            let alreadySent = false;

            if(type.includes('push')){
                payload.notification = { title, body, icon };
            }

            if (type.includes('app')) {
                payload.data = { app: "App Notification" };
            }

            await wss.clients.forEach(async(client) => {
                if(client.userId === userId && client.readyState === WebSocket.OPEN){
                    if(alreadySent && payload.notification){
                        payload.notification.title = null;
                    }

                    alreadySent = true;
                    await client.send(JSON.stringify(payload));
                }
            })

            return resolve(true);
        });
    }

    catch (error) {
        console.log("Error sending WebSocket notification:", error);
        return false;
    }
};





module.exports = {
    startWebSocketServer,
    sendWebSocketNotification
};
