const transporter = require("../utils/emailUtils");
const Result = require("../models/resultsModel");
require("dotenv").config();
exports.sendAbgFormEmail = async (request, response) => {
  const { id, interpreted_by } = request.body;
  console.log("requests: ", request.body);
  try {
    const data = await Result.viewResultFormById(id);
    if (!data) {
      return response.status(404).json({ error: "Request not found" });
    }
    const extracted_result = JSON.parse(data.extracted_text);

    const mailOptions = {
      from: process.env.NODE_APP_GOOGLE_EMAIL,
      to: "acecruz14.e@gmail.com",
      subject: "ABG Form Submission",
      template: "abgform",
      context: {
        patient_name: data.patient_name,
        age: data.age,
        sex: data.sex,
        diagnosis: data.diagnosis,
        requestor: data.requestor,
        respiratory_therapists: data.respiratory_therapists,
        physician_doctor: interpreted_by,
        date_created: data.date_created,
        extracted: {
          pH: extracted_result?.pH,
          pCO2: extracted_result?.pCO2,
          PO2: extracted_result?.PO2,
          HCO3: extracted_result?.HCO3,
          TCO2: extracted_result?.TCO2,
          BE: extracted_result?.BE,
          SO2: extracted_result?.SO2,
          FIO2: extracted_result?.FIO2,
        },
      },
    };
    await transporter.sendMail(mailOptions);
    response.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Email error:", error);
    response.status(500).json({ error: "Failed to send email" });
  }
};
