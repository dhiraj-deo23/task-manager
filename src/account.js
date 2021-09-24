const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.HOST,
  port: process.env.MAILPORT,
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});

// send email
const welcomeMail = (name, mail) => {
  transporter.sendMail(
    {
      from: "mail2drazzdeo@gmail.com",
      to: mail,
      subject: "Thanks for joining in",
      text: `Welcome to the app, ${name}. Let me know how is it going.`,
    },
    (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("Message sent");
    }
  );
};
const goodbyeMail = (name, mail) => {
  transporter.sendMail(
    {
      from: "namastedental.com",
      to: mail,
      subject: "Account Removed",
      text: `Your account has been removed, ${name}.`,
    },
    (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("Message sent");
    }
  );
};

module.exports = {
  welcomeMail,
  goodbyeMail,
};
