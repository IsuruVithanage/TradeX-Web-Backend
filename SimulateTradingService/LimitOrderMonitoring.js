const WebSocket = require('ws');
const axios = require('axios');
const { getAllOrdersByType } = require('./controllers/OrderController');
const { updateOrderStatus } = require('./controllers/OrderController');

let coinList = [];
let marketPrice = {};
let orders = [];

const startRealtimeMonitoring = async () => {
    try {
        console.log('Starting Realtime Monitoring...');

        // Fetch coin list
        const response = await axios.get('https://raw.githubusercontent.com/IsuruVithanage/TradeX-Web/dev/src/Assets/Images/Coin%20Images.json');
        coinList = JSON.parse(response.data.coinsList);
        //console.log(coinList);

        setInterval( async() => {
            orders = await getAllOrdersByType('Limit','Pending');
            //console.log(orders);

            /*if(ws.readyState === 3 && orders.length > 0){
                await connectWebSocket();
            }
*/
        }, 5000);

        await connectWebSocket();

        setInterval(() => {
            checkOrders();
            console.log(marketPrice);
        }, 1000);
    } catch (error) {
        console.log('Realtime monitoring error:', error);
    }
};

const checkOrders = () => {
    try {
        orders.forEach(async (order) => {
            if (marketPrice[order.coin] !== undefined && order.type === 'Limit') {
                if (order.price <= marketPrice[order.coin]) {
                    console.log('Order matched:', order);
                    await updateOrderStatus(order.orderId, 'Completed');
                    console.log(`Order ${order.orderId} status updated to 'Completed'`);
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
