const WebSocket = require('ws');
const axios = require('axios');
const { getAllRunningAlerts, editAlert, sendNotification} = require('./controllers/AlertController');


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

        }, 3000);

        
         
        setInterval(async() => {
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
            const {deviceToken, userId, coin, condition, price, emailActiveStatus, runningStatus} = alert;
            const currentPrice = marketPrice[coin];

            if (currentPrice !== undefined && runningStatus) {
                if( 
                    ( condition === 'Above' && currentPrice > price ) ||
                    ( condition === 'Below' && currentPrice < price ) ||
                    ( condition === 'Equals' && currentPrice === price )
                ){  

                    const coinName = coinList[coin].name;
                    const type = emailActiveStatus ? 'both' : 'push';
                    const localPrice = "$ " + currentPrice.toLocaleString();
                    alert.runningStatus = false;

                    editAlert({query: {alertId: alert.alertId}, body: {runningStatus: false}})
                    .then(async() => {
                        sendNotification({ 
                            params: {type: type }, 
                            body: {
                                userId: userId,
                                deviceToken: deviceToken,
                                title: coinName + "  -  " + localPrice,
                                body: "Hello there! " + coinName + " is now at " + localPrice,
                                onClick: 'http://localhost:3000/alert',
                                emailHeader: `
                                    <img width="5%" height="5%" style="margin: auto 1% auto 0;"
                                    src="${coinList[coin].img}" alt="${coinName}"/>
                                    ${coinName} is now at ${localPrice}
                                `,
                                emailBody: `
                                    <p style="margin-top: 7%;">Hello Trader,</p>
                                    <p>
                                        We wanted to inform you that <span  style="font-weight: bold;">${coinName} (${coin})</span>
                                        has now reached a price of <span  style="font-weight: bold;">${localPrice}</span>. 
                                        Stay updated on market prices and make your best decisions.
                                    </p>
                                    <p>Good luck and happy trading!</p><br>
                                    <p style="margin: 0;">Best regards,</p>
                                    <p style="margin-top: 0;">TradeX Team.</p>
                                `,
                            }
                        })
                        .catch (() => {
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
