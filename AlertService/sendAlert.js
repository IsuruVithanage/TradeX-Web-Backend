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




const sendAlert = (payload) => {
    return new Promise((resolve, reject) => {
        try {
            const message = {
                token: payload.token,
                notification: {
                    title: payload.title,
                    body: payload.body,
                },
                webpush: {
                    notification: {
                        icon: 'https://raw.githubusercontent.com/IsuruVithanage/TradeX-Web/dev/src/Assets/Images/TradeX-mini-logo.png'
                    },
                    fcmOptions: {
                        link: 'http://localhost:3000/alert'
                    },
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