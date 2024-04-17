const admin = require('firebase-admin');
require('dotenv').config();

try{
    admin.initializeApp({credential: admin.credential.cert({
        type: process.env.TYPE,
        project_id: process.env.PROJECT_ID,
        private_key_id: process.env.PRIVATE_KEY_ID,
        private_key: process.env.PRIVATE_KEY,
        client_email: process.env.CLIENT_EMAIL,
        client_id: process.env.CLIENT_ID,
        auth_uri: process.env.AUTH_URI,
        token_uri: process.env.TOKEN_URI,
        auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.CLIENT_X509_CERT_URL
    })});
}
catch (error) {
    console.log('Firebase admin initialization error', error);
}



const sendAlert = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const message = {
                token: data.token,
                notification: {
                    title: 'TradeX',
                    body: data.message,
                    image: 'https://raw.githubusercontent.com/IsuruVithanage/TradeX-Web/dev/src/Assets/Images/trade.png',
                },
                webpush: {
                    notification: {
                        icon: 'https://i.postimg.cc/gcfCW5yn/tlogo2.png'
                    }
                }
            };

            admin.messaging().send(message)
                .then(() => {
                    resolve();
                })
                .catch((error) => {
                    console.log('Error sending message:', error);
                    reject();
                });
        }

        catch (error) {
            console.log(error);
            reject();
        }
    });
};

module.exports = {
    sendAlert
};