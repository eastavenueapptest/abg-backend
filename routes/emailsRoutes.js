const express = require("express");
const router = express.Router();
const emailController = require("../controllers/emailController");

router.route("/send-abg-form").post(emailController.sendAbgFormEmail);

module.exports = router;
