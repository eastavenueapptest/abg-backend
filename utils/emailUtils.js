const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");
const { google } = require("googleapis");
require("dotenv").config();

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  GOOGLE_REFRESH_TOKEN,
  SENDER_EMAIL,
} = process.env;

const oAuth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });

const createTransporter = async () => {
  const accessTokenResponse = await oAuth2Client.getAccessToken();
  const accessToken = accessTokenResponse?.token ?? accessTokenResponse;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: SENDER_EMAIL,
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      refreshToken: GOOGLE_REFRESH_TOKEN,
      accessToken,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  transporter.use(
    "compile",
    hbs({
      viewEngine: {
        extname: ".handlebars",
        partialsDir: path.resolve("./emailTemplates"),
        defaultLayout: false,
      },
      viewPath: path.resolve("./emailTemplates"),
      extName: ".handlebars",
    })
  );

  return transporter;
};

const sendGridSmtp = () => {
  const transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 465,
    secure: true,
    auth: {
      user: "apikey",
      pass: process.env.SENDGRID_API_KEY,
    },
  });

  transporter.use(
    "compile",
    hbs({
      viewEngine: {
        extname: ".handlebars",
        partialsDir: path.resolve("./emailTemplates"),
        defaultLayout: false,
      },
      viewPath: path.resolve("./emailTemplates"),
      extName: ".handlebars",
    })
  );

  return transporter;
};

module.exports = { sendGridSmtp, createTransporter };
