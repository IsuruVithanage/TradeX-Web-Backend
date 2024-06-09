const WebSocket = require('ws');
const coins = ['BTC', 'ETH', 'ADA', 'BNB', 'XRP'];
let marketPrices = {};
let ws = { readyState: WebSocket.CLOSED };


const startGettingMarketPrices = async() => {
    try{
        connectWebSocket();

        setInterval(() => {
            if(ws.readyState === 3){
                connectWebSocket();
            }
        }, 10000);
    }

    catch (error) {
        console.log('Realtime monitoring error:', error);
    }
}



const getMarketPrices = () => {
    return marketPrices;
}



const connectWebSocket = () => {
    try{
        ws = new WebSocket(
            'wss://stream.binance.com:443/stream?streams=' + 
            coins.map((coin) => coin.toLowerCase() + 'usdt@miniTicker').join('/')
        );

        ws.on('open', () => {
            console.log('WebSocket connection established.');
        });

        ws.on('message', (data) => {
            const priceData = JSON.parse(data);

            if(priceData.data !== undefined){
                marketPrices[priceData.data.s.slice(0, -4)] = parseFloat(priceData.data.c)
            };   
        });
        
        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            marketPrices = {};
        });
        
        ws.on('close', () => {
            console.log('WebSocket connection closed.');
            marketPrices = {};
        });
    }

    catch (error) {
        console.log('WebSocket connection error:', error);
        marketPrices = {};
    }
}





module.exports = {
    startGettingMarketPrices,
    getMarketPrices
};
