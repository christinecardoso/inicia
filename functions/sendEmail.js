const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  try {
    const { email } = JSON.parse(event.body);

    // Configure the email transport options
    const transporter = nodemailer.createTransport({
      // Your email service configuration
      service: 'gmail',
      auth: {
        user: 'htlcoupon@gmail.com', // Replace with your Gmail address
        pass: 'hometownlube$mia', // Replace with your Gmail password or application-specific password
      },
    });

    // Compose the email message
    const mailOptions = {
      from: 'htlcoupon@gmail.com',
      to: email,
      subject: 'Hello from HTL!',
      text: 'This is a test email sent from 11ty.',
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: 'Email sent successfully',
    };
  } catch (error) {
    console.error('Failed to send the email:', error);
    return {
      statusCode: 500,
      body: 'Failed to send the email',
    };
  }
};
