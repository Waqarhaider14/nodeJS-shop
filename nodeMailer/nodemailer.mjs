import {createTransport} from 'nodemailer';

const main = async (email, text, subject) => {
  try {
    const transporter = createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'barry.flatley@ethereal.email',
        pass: 'yqwQJch2gEzBZdHa4Q',
      },
      tls: {
        rejectUnauthorized: false
    }
    });
   
    // send mail with defined transport object
      await transporter.sendMail({
      from: 'barry.flatley@ethereal.email',
      to: email,
      subject: text, 
      text: subject
    });
    console.log(email)
  } catch (error) {
    console.error(error);
  }
};

export default  main ;
