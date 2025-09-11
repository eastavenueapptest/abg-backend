const transporter = require("../utils/emailUtils");
const Result = require("../models/resultsModel");
const User = require("../models/usersModel");
const { generateSecretKey } = require("../utils/generateSecretKey");

require("dotenv").config();

exports.sendAbgFormEmail = async (request, response, next) => {
  const { id } = request.body;
  try {
    if (!id) {
      return response.status(400).json({ error: "Missing required field: id" });
    }
    const data = await Result.viewResultFormById(id);
    if (!data || data.length === 0) {
      return response.status(404).json({ error: "Request not found" });
    }

    const mailOptions = {
      from: process.env.NODE_APP_GOOGLE_EMAIL,
      to: "anne.she00@gmail.com",
      subject: "ABG ResultForm Submission",
      template: "abgform",
      context: {
        patient_name: data?.patient_name,
      },
    };
    await transporter.sendMail(mailOptions);
    response.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error(
      "Email error (sendAbgFormEmail):",
      error.message,
      error.stack
    );
    return response
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

exports.handleSendGeneratekey = async (request, response, next) => {
  try {
    const { username } = request.params;
    console.log(username);
    const data = await User.searchByUsername(username);
    if (!data || data.length === 0) {
      return response.status(404).json({ error: "Request not found" });
    }
    const key = generateSecretKey();
    const updatedData = await User.setupSecretKey(username, { key: key });
    if (!updatedData || updatedData.affectedRows === 0) {
      return response.status(404).json({ error: "Request did not processed" });
    }
    const mailOptions = {
      from: process.env.NODE_APP_GOOGLE_EMAIL,
      to: data[0]?.email_address,
      subject: "Change Password Request",
      template: "generateKey",
      context: {
        employee_name: data[0]?.employee_name,
        key: key,
      },
    };

    await transporter.sendMail(mailOptions);
    response.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Email error:", error.message, error.stack);
    return response
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};
