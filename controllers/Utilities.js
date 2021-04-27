const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken'); //autenticar usuarios con tokens

function sendEmail(from, to, subject, html) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER, // user for sending email
            pass: process.env.MAIL // password for the user used
        }
    });
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

function signToken(email, id) {
  let payload = {
    email,
    id
  }
  let token = jwt.sign(payload, process.env.KEY, {
      expiresIn: 604800
  });
  return token;
}

module.exports.signToken = signToken;
module.exports.sendEmail = sendEmail;

// email: email,
//     id: insertResult.insertedId