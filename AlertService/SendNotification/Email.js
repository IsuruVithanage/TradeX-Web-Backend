require('dotenv').config();
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const fs = require('fs');


const oauth2Client = new OAuth2(
    process.env.MAIL_CLIENT_ID,
    process.env.MAIL_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
)

oauth2Client.setCredentials({
    refresh_token: process.env.MAIL_REFRESH_TOKEN
});



const sendEmailNotification = async (title, emailHeader, emailBody, receiverEmail, attachments) => {
    try{
        const html = fs
            .readFileSync('./SendNotification/emailTemplate.html', 'utf8')
            .replace('{{header}}', emailHeader || title)
            .replace('{{body}}', emailBody);

        /////////////////////////////

        // nodemailer
        // .createTransport({
        //     service: 'gmail',
        //     auth: {
        //         user: process.env.MAIL_EMAIL,
        //         pass: process.env.MAIL_PASSWORD1
        //     }
        // })

        ///////////////////////////////
        const accessToken = await oauth2Client.getAccessToken();

        nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.MAIL_EMAIL,
                clientId: process.env.MAIL_CLIENT_ID,
                clientSecret: process.env.MAIL_CLIENT_SECRET,
                refreshToken: process.env.MAIL_REFRESH_TOKEN,
                accessToken: accessToken.token
            }
        }).sendMail({
            from: '"TradeX" <tradexsimulation@gmail.com>',
            to: receiverEmail,
            subject: title,
            html: html,
            attachments: attachments 
        })
        .then(() => {
            console.log('Email sent..!');
            return true;
        })
        .catch((error) => {
            throw error;
        });
    }

    catch (error) {
        console.log('Email sending error:', error);
        throw new Error('Error sending email notification');

        // const news = await newsRepository.createQueryBuilder('news')
        // .where(':userId = ANY(news.favorite)', { userId })
        // .getMany();
 
    }
}

module.exports = sendEmailNotification;
