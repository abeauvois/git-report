require("dotenv").config();

const { google } = require("googleapis");

const nodemailer = require("nodemailer");

const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground" // Redirect URL
);

oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_CLIENT_REFRESH_TOKEN });
const accessToken = oauth2Client.getAccessToken();

const smtpTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.GMAIL_EMAIL,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_CLIENT_REFRESH_TOKEN,
    accessToken: accessToken,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const mailOptions = ({ to, subject, text }) => {
  console.log(text);
  return {
    from: process.env.GMAIL_EMAIL,
    to: to || process.env.GMAIL_EMAIL,
    subject: subject || "Test Monthly Report",
    generateTextFromHTML: true,
    html: text,
  };
};

// const mailOptions = {
//     from: process.env.GMAIL_EMAIL,
//     to: to || process.env.GMAIL_EMAIL,
//     subject: subject || "Test Monthly Report",
//     generateTextFromHTML: true,
//     html: "<b>test</b>"
// };

const nodeCallback = (error, info) => {
  if (error) {
    console.log(error);
  } else {
    console.log(info);
  }
  smtpTransport.close();
};

const sendMail = ({ text }) => smtpTransport.sendMail(mailOptions({ text }), nodeCallback);

module.exports = {
  sendMail,
};
