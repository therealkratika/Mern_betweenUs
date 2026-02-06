const nodemailer = require("nodemailer");

const sendMail = async ({ to, subject, html }) => {
  if (!to) {
    throw new Error("No recipient email provided");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"Between Us 💜" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
};

module.exports = sendMail;
