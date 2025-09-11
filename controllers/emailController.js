const { google } = require("googleapis");
const { createTransporter } = require("../utils/emailUtils");
const Result = require("../models/resultsModel");
const { generateSecretKey } = require("../utils/generateSecretKey");

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  REFRESH_TOKEN,
  SENDER_EMAIL,
} = process.env;

const oAuth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

exports.sendAbgFormEmail = async (request, response, next) => {
  const { id } = request.body;
  try {
    const data = await Result.viewResultFormById(id);
    if (!data) {
      return response.status(404).json({ error: "Request not found" });
    }

    const transporter = await createTransporter();
    const mailOptions = {
      from: SENDER_EMAIL,
      to: "anne.she00@gmail.com",
      subject: "ABG ResultForm Submission",
      template: "abgform",
      context: {
        patient_name: data?.patient_name,
      },
    };

    const result = await transporter.sendMail(mailOptions);
    response.status(200).json({ message: "Email sent successfully" });
    return result;
  } catch (error) {
    console.error("Email error:", error);
    next(error);
  }
};

exports.handleSendGeneratekey = async (request, response, next) => {
  try {
    const { username } = request.params;
    console.log(username);
    const data = await User.searchByUsername(username);
    if (!data || data.length === 0) {
      return response.status(404).json({ error: "User not found" });
    }

    const key = generateSecretKey();
    const updatedData = await User.setupSecretKey(username, { key: key });
    if (!updatedData.affectedRows) {
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

    const emailResult = await transporter.sendMail(mailOptions);
    console.log({ data: emailResult, message: "Email sent successfully" });
    response.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Email error:", error);
    next(error);
  }
};

// sendMail()
//   .then((result) => console.log("Email sent...", result))
//   .catch((error) => console.log(error.message));

// const transporter = require("../utils/emailUtils");
// const Result = require("../models/resultsModel");
// const User = require("../models/usersModel");
// const { generateSecretKey } = require("../utils/generateSecretKey");

// require("dotenv").config();

// exports.sendAbgFormEmail = async (request, response, next) => {
//   const { id } = request.body;
//   try {
//     const data = await Result.viewResultFormById(id);
//     if (!data) {
//       return response.status(404).json({ error: "Request not found" });
//     }

//     const mailOptions = {
//       from: process.env.NODE_APP_GOOGLE_EMAIL,
//       to: "anne.she00@gmail.com",
//       subject: "ABG ResultForm Submission",
//       template: "abgform",
//       context: {
//         patient_name: data?.patient_name,
//       },
//     };
//     await transporter.sendMail(mailOptions);
//     response.status(200).json({ message: "Email sent successfully" });
//   } catch (error) {
//     console.error("Email error:", error);
//     next(error);
//   }
// };

// exports.handleSendGeneratekey = async (request, response, next) => {
//   try {
//     const { username } = request.params;
//     console.log(username);
//     const data = await User.searchByUsername(username);
//     if (!data) {
//       return response.status(404).json({ error: "Request not found" });
//     }
//     const key = generateSecretKey();
//     const updatedData = await User.setupSecretKey(username, { key: key });
//     if (!updatedData.affectedRows) {
//       return response.status(404).json({ error: "Request did not processed" });
//     }
//     const mailOptions = {
//       from: process.env.NODE_APP_GOOGLE_EMAIL,
//       to: data[0]?.email_address,
//       subject: "Change Password Request",
//       template: "generateKey",
//       context: {
//         employee_name: data[0]?.employee_name,
//         key: key,
//       },
//     };

//     await transporter.sendMail(mailOptions);
//     response.status(200).json({ message: "Email sent successfully" });
//   } catch (error) {
//     console.error("Email error:", error);
//     next(error);
//   }
// };
