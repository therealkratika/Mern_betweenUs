const axios = require("axios");

const sendMail = async ({ to, subject, html }) => {
  // If key is missing, skip email safely
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
          email: process.env.EMAIL_FROM || "noreply@betweenus.app"
        },
        to: [{ email: to }],
        subject,
        htmlContent: html
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    console.log("✅ Email sent to:", to);
  } catch (err) {
    console.error(
      "❌ BREVO EMAIL ERROR:",
      err.response?.data || err.message
    );
    // IMPORTANT: never throw
  }
};

module.exports = sendMail;
