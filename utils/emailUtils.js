const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODE_APP_GOOGLE_EMAIL,
    pass: process.env.NODE_APP_GOOGLE_PASS,
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

module.exports = transporter;
