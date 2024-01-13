const User = require('../models/user');

const OK = 200;
const CREATED = 201;
const ERROR_CODE = 400;
const NOT_FOUND = 404;
const SERVER_ERROR = 500;

async function getUsers(req, res) {
  try {
    const users = await User.find();
    res.status(OK).json(users);
  } catch (err) {
    res.status(SERVER_ERROR).json({ message: 'На сервере произошла ошибка' });
  }
}

async function getUserById(req, res) {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(NOT_FOUND).json({ message: 'Запрашиваемый пользователь не найден' });
    }
    return res.status(OK).json(user);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(ERROR_CODE).json({ message: 'Некорректный формат идентификатора пользователя' });
    }
    return res.status(SERVER_ERROR).json({ message: 'На сервере произошла ошибка' });
  }
}

async function createUser(req, res) {
  try {
    const newUser = new User(req.body);
    await newUser.validate();

    await newUser.save();
    return res.status(CREATED).json(newUser);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(ERROR_CODE).json({ message: 'Ошибка валидации данных пользователя' });
    }
    return res.status(SERVER_ERROR).json({ message: 'На сервере произошла ошибка' });
  }
}

async function updateProfile(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(NOT_FOUND).json({ message: 'Запрашиваемый пользователь не найден' });
    }

    user.name = req.body.name;
    user.about = req.body.about;

    await user.validate();
    await user.save();
    return res.status(OK).json(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(ERROR_CODE).json({ message: 'Ошибка валидации данных пользователя' });
    }
    return res.status(SERVER_ERROR).json({ message: 'На сервере произошла ошибка' });
  }
}

async function updateAvatar(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(NOT_FOUND).json({ message: 'Запрашиваемый пользователь не найден' });
    }
    user.avatar = req.body.avatar;
    await user.validate();
    await user.save();
    return res.status(OK).json(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(ERROR_CODE).json({ message: 'Ошибка валидации данных пользователя' });
    }
    return res.status(SERVER_ERROR).json({ message: 'На сервере произошла ошибка' });
  }
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
};
