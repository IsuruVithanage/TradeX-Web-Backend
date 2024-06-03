require('dotenv').config();
const nodemailer = require('nodemailer');
const axios = require('axios');
const fs = require('fs');



const sendEmailNotification = async (title, emailHeader, emailBody, receiverEmail, attachments) => {
    try{
        const html = fs
            .readFileSync('./SendNotification/emailTemplate.html', 'utf8')
            .replace('{{header}}', emailHeader || title)
            .replace('{{body}}', emailBody);


        const accessToken = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: process.env.MAIL_CLIENT_ID,
            client_secret: process.env.MAIL_CLIENT_SECRET,
            refresh_token: process.env.MAIL_REFRESH_TOKEN,
            grant_type: 'refresh_token'
        });


        nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.MAIL_EMAIL,
                clientId: process.env.MAIL_CLIENT_ID,
                clientSecret: process.env.MAIL_CLIENT_SECRET,
                refreshToken: process.env.MAIL_REFRESH_TOKEN,
                accessToken: accessToken
                //  user: process.env.MAIL_EMAIL,
                //  pass: process.env.MAIL_PASSWORD
            }
        })
        .sendMail({
            from: '"TradeX" <tradexsimulation@gmail.com>',
            to: receiverEmail,
            subject: title,
            html: html,
            attachments: attachments 
        });
    }

    catch (error) {
        console.log('Email sending error:', error);
        throw new Error('Error sending email notification'); 
    }
}

module.exports = sendEmailNotification;
