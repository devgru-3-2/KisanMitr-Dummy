const dotenv = require('dotenv');
dotenv.config();
const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const { generateOTP } = require('../utils/otp');

const otps = new Map();

exports.sendOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    const otp = generateOTP();
    const message = `Your OTP for verification is ${otp}.`;

    const smsResult = await twilio.messages.create({
      to: `+91${phoneNumber}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      body: message,
    });

    otps.set(phoneNumber, otp);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending OTP' });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    const storedOtp = otps.get(phoneNumber);

    if (otp === storedOtp) {
      otps.delete(phoneNumber);
      res.status(200).json({ message: 'OTP verified successfully' });
    } else {
      res.status(401).json({ message: 'Invalid OTP' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
};


/*we use a Map data structure to store the OTPs for each phone number. 
When the sendOTP function is called, a new OTP is generated and stored 
in the map with the corresponding phone number as the key. 

When the verifyOTP function is called, it retrieves the stored OTP for the given 
phone number and compares it with the OTP provided in the request body. 
If they match, the OTP is deleted from the map and the function returns 
a success message. If they don't match, the function returns an error 
message indicating an invalid OTP.*/