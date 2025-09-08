const express = require("express");
const router = express.Router();
const emailController = require("../controllers/emailController");

router.route("/send-abg-form").post(emailController.sendAbgFormEmail);

router
  .route("/generate-secret-key/:username")
  .get(emailController.handleSendGeneratekey);

module.exports = router;
