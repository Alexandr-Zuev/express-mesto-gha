const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const OK = 200;
const CREATED = 201;
const SOLT_ROUND = 10;
const SECRET_KEY = '123';

async function getUsers(req, res, next) {
  try {
    const users = await User.find();
    return res.status(OK).json(users);
  } catch (err) {
    return next(err);
  }
}

async function getUserById(req, res, next) {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error();
      error.status = 404;
      throw error;
    }
    return res.status(OK).json(user);
  } catch (err) {
    return next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const {
      name = 'Жак-Ив Кусто', about = 'Исследователь', avatar = 'https://avatars.mds.yandex.net/i?id=7c542627e95c40e4b3b603dd0c34179f4d5aab40-9264723-images-thumbs&n=13', email, password,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, SOLT_ROUND);

    const newUser = new User({
      name, about, avatar, email, password: hashedPassword,
    });

    await newUser.validate();
    await newUser.save();
    const userRes = {
      _id: newUser._id,
      name: newUser.name,
      about: newUser.about,
      avatar: newUser.avatar,
      email: newUser.email,
    };
    return res.status(CREATED).json(userRes);
  } catch (err) {
    return next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error();
      error.status = 404;
      throw error;
    }
    user.name = req.body.name;
    user.about = req.body.about;
    await user.validate();
    await user.save();
    return res.status(OK).json(user);
  } catch (err) {
    return next(err);
  }
}

async function updateAvatar(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error();
      error.status = 404;
      throw error;
    }
    user.avatar = req.body.avatar;
    await user.validate();
    await user.save();
    return res.status(OK).json(user);
  } catch (err) {
    return next(err);
  }
}

async function getMyProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error();
      error.status = 404;
      throw error;
    }
    return res.status(OK).json(user);
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        const token = jwt.sign({ _id: user._id }, SECRET_KEY, { expiresIn: '1w' });
        res.cookie('jwt', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
        return res.status(OK).json({ message: 'Авторизация успешна', token });
      }
      const error = new Error();
      error.status = 401;
      throw error;
    }
    const error = new Error();
    error.status = 401;
    throw error;
  } catch (err) {
    return next(err);
  }
}
module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
  getMyProfile,
  login,
};
