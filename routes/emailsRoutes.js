const express = require("express");
const router = express.Router();
const emailController = require("../controllers/emailController");

router.post("/send-abg-form", emailController.sendAbgFormEmail);
module.exports = router;
