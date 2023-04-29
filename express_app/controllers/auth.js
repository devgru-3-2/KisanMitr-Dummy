const dotenv = require('dotenv');
dotenv.config();  

const accountSid = 'ACcff34f5bc735cb81acd6fcab44b39cdf';
const authToken = '6f8ab595761ccc709557a02270a2a9d7';
const verifyServiceSid = 'VAd3f8bf67074bc8d8b8dcf3d13a5a59ee';
const fromPhoneNumber = '+919148764621';

const client = require('twilio')(accountSid, authToken);


exports.sendOTP = async (phone) => {
  try {
    const verification = await client.verify.v2.services(verifyServiceSid).verifications.create({
      to: `+91${phone}`,
      channel: 'sms',
      locale: 'en',
    });

    return verification;

  } catch (error) {
    console.error(error);
    throw new Error('Error sending OTP');
  }
};
/*exports.verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    const verificationCheck = await client.verify.v2.services(verifyServiceSid).verificationChecks.create({
      to: phoneNumber,
      code: otp,
    });

    if (verificationCheck.status === 'approved') {
      res.redirect('/farmer/dashboard');

    } else {
      res.status(401).json({ message: 'Invalid OTP' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
};*/

exports.verifyOTP = async (phoneNumber, otp) => {
  try {
    const verificationCheck = await client.verify.v2.services(verifyServiceSid).verificationChecks.create({
        to: `+91${phone}`,
        code: otp,
      });

    if (verificationCheck.status === 'approved') {
      return { success: true, message: 'OTP verified successfully' };
    } else {
      return { success: false, message: 'Invalid OTP' };
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error verifying OTP' };
  }
};


