const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const handlebarOptions = {
  viewEngine: {
    extname: ".handlebars",
    layoutsDir: path.join(__dirname, "../views/email-templates"),
    defaultLayout: false,
  },
  viewPath: path.join(__dirname, "../views/email-templates"),
  extName: ".handlebars",
};

transporter.use("compile", hbs(handlebarOptions));

module.exports = transporter;
