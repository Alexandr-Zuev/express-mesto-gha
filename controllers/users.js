const User = require('../models/user');

async function getUsers(req, res) {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getUserById(req, res) {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: 'Запрашиваемый пользователь не найден' });
    }
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function createUser(req, res) {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function updateProfile(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Запрашиваемый пользователь не найден' });
    }
    user.name = req.body.name;
    user.about = req.body.about;
    await user.save();
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function updateAvatar(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Запрашиваемый пользователь не найден' });
    }
    user.avatar = req.body.avatar;
    await user.save();
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
};
