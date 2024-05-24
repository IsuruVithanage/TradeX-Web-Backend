const WebSocket = require('ws');
const axios = require('axios');
const { getAllOrdersByType, updateOrderStatus, updateOrderTime } = require('./controllers/OrderController');

let coinList = [];
let marketPrice = {};
let time = {};
let orders = [];
let wss;

const startRealtimeMonitoring = async () => {
    try {
        console.log('Starting Realtime Monitoring...');

        // Fetch coin list
        const response = await axios.get('https://raw.githubusercontent.com/IsuruVithanage/TradeX-Web/dev/src/Assets/Images/Coin%20Images.json');
        coinList = JSON.parse(response.data.coinsList);
        //console.log(coinList);

        wss = new WebSocket.Server({ port: 8081 });

        wss.on('connection', (ws) => {
            console.log('WebSocket connection established with client');
        });


        setInterval( async() => {
            orders = await getAllOrdersByType('Limit','Pending');

        }, 3000);

        await connectWebSocket();

        setInterval(() => {
            checkOrders();
            //console.log(time);
        }, 1000);
    } catch (error) {
        console.log('Realtime monitoring error:', error);
    }
};

const checkOrders = () => {
    try {
        orders.forEach(async (order) => {
            if (marketPrice[order.coin] !== undefined && order.category === 'Limit') {
                console.log('Checking order:', order.price, marketPrice[order.coin]);
                if (order.price <= marketPrice[order.coin]) {
                    console.log('Order matched:', order);

                    const requestBody = {
                        userId: 1,
                        title: 'TradeX',
                        body: `Your order for ${order.coin} has been completed at ${marketPrice[order.coin]}.`,
                        onClick: 'http://localhost:3000/simulate'
                    };

                    await updateOrderStatus(order.orderId, 'Completed');
                    await updateOrderTime(order.orderId, time[order.coin]);
                    console.log(`Order ${order.orderId} status updated to 'Completed'`);

                    fetch('http://localhost:8002/alert/send/push', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(requestBody)
                    })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Failed to send alert');
                            }
                            console.log('Alert sent successfully');
                            wss.clients.forEach((client) => {
                                client.send(JSON.stringify({ type: 'order_completed', order }));
                            });
                        })
                        .catch(error => {
                            console.error('Error sending alert:', error);
                        });
                }
            }
        });
    } catch (error) {
        console.log('Check orders error:', error);
    }
};


const connectWebSocket = () => {
    return new Promise((resolve, reject) => {
        try {
            const first10Coins = coinList.slice(0, 10);
            first10Coins.forEach((coinSymbol) => {
                const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${coinSymbol.toLowerCase()}@miniTicker`);

                ws.on('open', () => {
                    console.log(`WebSocket connection established for ${coinSymbol}`);
                    resolve();
                });

                ws.on('message', (data) => {
                    try {
                        const priceData = JSON.parse(data);
                        if (priceData && priceData.s && priceData.c) {
                            marketPrice[priceData.s.slice(0, -4)] = parseFloat(priceData.c);

                            const date = new Date(priceData.E);
                            date.setSeconds(0, 0); // Set milliseconds to 0
                            time[priceData.s.slice(0, -4)] = date.getTime();
                        }
                    } catch (error) {
                        console.error('Error parsing message:', error);
                    }
                });

                ws.on('error', (error) => {
                    console.error(`WebSocket error for ${coinSymbol}:`, error);
                    reject();
                });

                ws.on('close', () => {
                    console.log(`WebSocket connection closed for ${coinSymbol}`);
                });
            });
        } catch (error) {
            console.log('WebSocket connection error:', error);
            reject();
        }
    });
};

module.exports = startRealtimeMonitoring;
