import nodemailer from 'nodemailer';

const sendEmail = async (to, subject, html, replyTo = null) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Drone Rental Website" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    replyTo 
  });
};

export default sendEmail;
