const otpGenerator = require('otp-generator');

exports.generateOTP = () => {
  return otpGenerator.generate(6, { upperCase: false, specialChars: false });
};
