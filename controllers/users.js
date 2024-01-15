const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const OK = 200;
const CREATED = 201;
const ERROR_CODE = 400;
const UNAUTHORIZED = 401;
const NOT_FOUND = 404;
const SERVER_ERROR = 500;
const SOLT_ROUND = 10;
const SECRET_KEY = '123';

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
    const {
      name = 'Жак-Ив Кусто', about = 'Исследователь', avatar = 'ссылка', email, password,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, SOLT_ROUND);

    const newUser = new User({
      name, about, avatar, email, password: hashedPassword,
    });

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

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ _id: user._id }, SECRET_KEY, { expiresIn: '1w' });
      res.cookie('jwt', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

      return res.status(OK).json({ message: 'Авторизация успешна', token });
    }
    return res.status(UNAUTHORIZED).json({ message: 'Неправильная почта или пароль' });
  } catch (err) {
    return res.status(SERVER_ERROR).json({ message: 'На сервере произошла ошибка' });
  }
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
  login,
};
