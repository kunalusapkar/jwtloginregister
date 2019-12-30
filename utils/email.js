const nodemailer = require("nodemailer");
const sendEmail = async options => {
    // Create a transporter
    const transporter = await nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    // Define a email options
    const mailOptions = {
        from: "Kunal <kunal@g.io>",
        to: options.email,
        subject: options.subject,
        text: options.message
        // html:
    };
    // Actually send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;