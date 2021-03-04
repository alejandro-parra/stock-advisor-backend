const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER, // user for sending email
        pass: process.env.MAIL, // password for the user used
    }
});

function sendEmail(from, to, subject, html) {
    return new Promise((resolve, reject) => {
        let mailOptions = {
            from: from,
            to: to,
            subject: subject,
            html: html
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                reject(error)
            } else {
                resolve('success')
            }
        });
    });
}

module.exports.sendEmail = sendEmail;