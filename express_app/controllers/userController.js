const User = require('../models/User');
const Farmer = require('../models/Farmer');
const Distributor = require('../models/Distributor');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting users' });
  }
};

exports.addUser = async (req, res) => {
  try {
    const { name, role } = req.body;

    // Determine which collection to add the user to
    let user;
    switch (role) {
      case 'Farmer':
        user = new Farmer({ name });
        break;
      case 'Distributor':
        user = new Distributor({ name });
        break;
      default:
        user = new User({ name, role });
        break;
    }

    await user.save();
    res.status(201).json({ message: 'User added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding user' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role } = req.body;

    // Determine which collection to update the user in
    let user;
    switch (role) {
      case 'Farmer':
        user = await Farmer.findByIdAndUpdate(id, { name });
        break;
      case 'Distributor':
        user = await Distributor.findByIdAndUpdate(id, { name });
        break;
      default:
        user = await User.findByIdAndUpdate(id, { name, role });
        break;
    }

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Determine which collection to delete the user from
    let user;
    switch (role) {
      case 'Farmer':
        user = await Farmer.findByIdAndDelete(id);
        break;
      case 'Distributor':
        user = await Distributor.findByIdAndDelete(id);
        break;
      default:
        user = await User.findByIdAndDelete(id);
        break;
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};
