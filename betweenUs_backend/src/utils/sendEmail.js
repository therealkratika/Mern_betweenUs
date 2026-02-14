const axios = require("axios");

const sendMail = async ({ to, subject, html }) => {
  console.log("📧 sendMail called");
  console.log("BREVO KEY PRESENT:", !!process.env.BREVO_API_KEY);

  if (!process.env.BREVO_API_KEY) {
    console.warn("⚠️ BREVO_API_KEY missing. Email skipped.");
    return;
  }
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "BetweenUs",
          email: process.env.EMAIL_FROM .trim()
        },
        to: [{ email: to }],
        subject,
        htmlContent: html
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Email sent via Brevo");
  } catch (err) {
    console.error(
      "❌ BREVO EMAIL ERROR:",
      err.response?.data || err.message
    );
  }
};

module.exports = sendMail;
