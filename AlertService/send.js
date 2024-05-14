const nodemailer = require('nodemailer');
const fs = require('fs');

const sendNotification = async (req, res) => {
    try{
        const email = req.body.email;

        const html = fs.readFileSync('./a.html', 'utf8');

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'tradexsimulation@gmail.com',
                pass: 'uhqwzajvnksqpxtd'
            }
        });

        const mailOptions = {
            from: '"TradeX" <tradexsimulation@gmail.com>',
            to: email,
            subject: 'Alert Notification',
            html: html,
        };

        console.log('Sending email...');

        transporter.sendMail(mailOptions)
        .then(() => {
            console.log('Email sent..!');
            res.status(200).json({ message: 'Email sent' });
        })
        .catch((error) => {
            console.log('Email sending failed:', error);
            res.status(500).json({ message: 'Email sending failed' });
        });
    }

    catch (error) {
        console.log('Email sending error:', error);
        res.status(500).send('Email sending error');
    }
}

module.exports = sendNotification;