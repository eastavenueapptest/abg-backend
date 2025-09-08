const express = require("express");
const router = express.Router();
const emailController = require("../controllers/emailController");

router.post("/send-abg-form", emailController.sendAbgFormEmail);

router
  .route("/generate-secrey-key/:username")
  .get(emailController.handleSendGeneratekey);

module.exports = router;
