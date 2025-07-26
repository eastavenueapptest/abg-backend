const transporter = require("../utils/emailUtils");
const Result = require("../models/resultsModel");
require("dotenv").config();
exports.sendAbgFormEmail = async (request, response) => {
  const { id, interpreted_by } = request.body;
  try {
    const data = await Result.viewResultFormById(id);
    if (!data) {
      return response.status(404).json({ error: "Request not found" });
    }

    const mailOptions = {
      from: process.env.NODE_APP_GOOGLE_EMAIL,
      to: "acecruz14.e@gmail.com",
      subject: "ABG ResultForm Submission",
      template: "abgform",
      context: {
        patient_name: data.patient_name,
      },
    };
    await transporter.sendMail(mailOptions);
    response.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Email error:", error);
    response.status(500).json({ error: "Failed to send email" });
  }
};
