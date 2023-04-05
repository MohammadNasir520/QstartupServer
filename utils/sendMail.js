//  send mail function
const nodemailer = require("nodemailer")
exports.sendEMail = async (fromEmail, toEmail, subject, html) => {

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.Email,
            pass: process.env.GmailAppPassword,
        },
    });

    const mailOptions = ({
        from: fromEmail,
        to: toEmail,
        subject: subject,

        html: html,
    });
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error)
        } else {
            console.log('Email sent: ' + info.response);
        }
    })

}
