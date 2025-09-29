const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.NODE_APP_GOOGLE_EMAIL,
    pass: process.env.NODE_APP_GOOGLE_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  socketTimeout: 60000,
  connectionTimeout: 60000,
});

transporter.use(
  "compile",
  hbs({
    viewEngine: {
      extName: ".handlebars",
      partialsDir: path.join(__dirname, "../emailTemplates"),
      defaultLayout: false,
    },
    viewPath: path.join(__dirname, "../emailTemplates"),
    extName: ".handlebars",
  })
);

module.exports = transporter;
