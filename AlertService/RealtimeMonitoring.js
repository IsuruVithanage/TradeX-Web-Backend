const WebSocket = require('ws');
const axios = require('axios');
const { getAllRunningAlerts, editAlert } = require('./controllers/AlertController');
const { sendAlert } = require('./sendAlert');

let coinList = [];
let marketPrice = {};
let ws = { readyState: WebSocket.CLOSED };
let alerts = [];



const startRealtimeMonitoring = async() => {
    try{
        console.log('Starting Realtime Monitoring...');

        await axios.get('https://raw.githubusercontent.com/IsuruVithanage/TradeX-Web/dev/src/Assets/Images/Coin%20Images.json')
        .then((response) => {
            coinList = response.data;
        })
        .catch((error) => {
            console.log('Coin list fetching error:', error)
        });



        setInterval( async() => {
            alerts = await getAllRunningAlerts();

            if(ws.readyState === 3 && alerts.length > 0){
                await connectWebSocket();
            }

            updateStreams();

        }, 5000);



        setInterval(() => {
            if(ws.readyState === 1){
            checkAlerts(); 
            console.log(marketPrice);
            }
        }, 1000);
    }

    catch (error) {
        console.log('Realtime monitoring error:', error);
    }
}





const updateStreams = () => {
    try{
        const prevStreams = Object.keys(marketPrice).map(coin => coin.toLowerCase() + 'usdt@miniTicker');
        const newStreams = [...new Set(alerts.map(alert => alert.coin))].map(coin => coin.toLowerCase() + 'usdt@miniTicker');


        if( JSON.stringify(prevStreams.sort()) !== JSON.stringify(newStreams.sort())){
            if(ws.readyState === 1){
                if(prevStreams.length > 0){
                    ws.send(JSON.stringify({ method: 'UNSUBSCRIBE', params: prevStreams, id: 1 }));
                }
                if(newStreams.length > 0){
                    ws.send(JSON.stringify({ method: 'SUBSCRIBE', params: newStreams, id: 1 }));
                }
                else{
                    ws.close();
                }
            }

            prevStreams
            .filter(coin => !newStreams.includes(coin))
            .forEach(coin => delete marketPrice[coin.slice(0, -15).toUpperCase()]);
        }
    }
    
    catch (error) {
        console.log('Update streams error:', error);
    }
}





const checkAlerts = () => {
    try{
        alerts.forEach((alert) => {
            const {coin, condition, price, runningStatus} = alert;

            if (marketPrice[coin] !== undefined && runningStatus) {
                if( 
                    ( condition === 'Above' && marketPrice[coin] > price ) ||
                    ( condition === 'Below' && marketPrice[coin] < price ) ||
                    ( condition === 'Equals' && marketPrice[coin] === price )
                ){ 
                    const coinName = coinList[alert.coin].name;
                    alert.runningStatus = false;
                    editAlert({query: {alertId: alert.alertId}, body: {runningStatus: false}})
                    .then(() => {
                        sendAlert({
                            token: alert.deviceToken, 
                            title: coinName,
                            body: `Hello there! ${coinName} is now at ${marketPrice[alert.coin]}`,
                        }).then(() => {
                            console.log('\x1b[32mNotification sent\x1b[0m for alertID:', alert.alertId);
                        }).catch(() => {
                            editAlert({query: {alertId: alert.alertId}, body: {runningStatus: true}});
                            console.log('\x1b[31mNotification sending failed\x1b[0m for alertID:', alert.alertId);
                        });
                    });
                }
            }
        });
    }

    catch (error) {
        console.log('Check alerts error:', error);
    }
}





const connectWebSocket = () => {
    return new Promise((resolve, reject) => {
        try{
            ws = new WebSocket('wss://stream.binance.com:9443/ws');

            ws.on('open', () => {
                console.log('WebSocket connection established.');
                resolve();
            });

            ws.on('message', (data) => {
                const priceData = JSON.parse(data);
                if(priceData.s){
                    marketPrice[priceData.s.slice(0, -4)] = parseFloat(priceData.c)
                };   
            });
            
            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                reject();
            });
            
            ws.on('close', () => {
                console.log('WebSocket connection closed.');
            });
        }

        catch (error) {
            console.log('WebSocket connection error:', error);
            reject();
        }
    });
}





module.exports = startRealtimeMonitoring;
