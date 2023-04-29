const User = require('../models/userSchema');

exports.addUser = async (req, res) => {
  try {
    const { name, role } = req.body;

    // Save the user to the userSchema
    const user = new User({ name, role });
    await user.save();

    // Redirect the user to the specific register page based on their role
    switch (role) {
      case 'Farmer':
        res.redirect('/farmer/farmer-register');

        break;
      case 'Distributor':
        res.redirect('/distributor/distributor-register');
        break;
      case 'Nodal Agency':
        res.redirect('/nodalAgency/nodalAgency-register');
        break;
      default:
        res.redirect('/');
        break;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding user' });
  }
};
