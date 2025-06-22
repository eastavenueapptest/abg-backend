const transporter = require("../utils/emailUtils");

exports.sendAbgFormEmail = async (req, res) => {
  const { to, name } = req.body;

  const mailOptions = {
    from: `"My App" <${process.env.NODE_APP_GOOGLE_EMAIL}>`,
    to,
    subject: "ABG Form Submission",
    template: "abgform",
    context: {
      name,
      email: to,
    },
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
};
