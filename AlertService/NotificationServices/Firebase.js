const admin = require('firebase-admin');
require('dotenv').config();

try{
    admin.initializeApp({credential: admin.credential.cert({
        type: process.env.FCM_TYPE,
        project_id: process.env.FCM_PROJECT_ID,
        private_key_id: process.env.FCM_PRIVATE_KEY_ID,
        private_key: process.env.FCM_PRIVATE_KEY,
        client_email: process.env.FCM_CLIENT_EMAIL,
        client_id: process.env.FCM_CLIENT_ID,
        auth_uri: process.env.FCM_AUTH_URI,
        token_uri: process.env.FCM_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FCM_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FCM_CLIENT_X509_CERT_URL
    })});
}
catch (error) {
    console.log('Firebase admin initialization error', error);
}



const sendFcmNotification = async (deviceToken, type, title, body, icon, onClick) => {
    try {
        if(!deviceToken){
            throw new Error('Device Token not found');
        }

        const message = {
            token: deviceToken,
        }

        if(type.includes('push')){
            message.notification = {	
                title: title || 'TradeX',
                body: body,
            };

            message.webpush = {
                notification: { icon: icon },
                fcmOptions: { link: onClick || 'http://localhost:3000/' },
            };
        }

        if(type.includes('app')){
            message.data = {
                app: "App Notification",
            };
        }

        
        await admin.messaging().send(message);

        return true;
    }

    catch (error) {
        console.log("Error sending push notification:", error);
        throw new Error('Error sending push notification');
    }
}


module.exports = sendFcmNotification;