const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/user');

const OK = 200;
const CREATED = 201;
const SOLT_ROUND = 10;
const SECRET_KEY = '123';

const userSchema = Joi.object({
  name: Joi.string().min(2).max(30),
  about: Joi.string().min(2).max(30),
  avatar: Joi.string().uri(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required().min(4),
});

const userIdSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(30).required(),
  about: Joi.string().min(2).max(30).required(),
});

const updateAvatarSchema = Joi.object({
  avatar: Joi.string().uri().required(),
});

async function getUsers(req, res, next) {
  try {
    const users = await User.find();
    return res.status(OK).json(users);
  } catch (err) {
    return next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    const { userId } = req.params;
    await userIdSchema.validateAsync(userId);

    try {
      const user = await User.findById(userId);

      if (!user) {
        const error = new Error('Пользователь не найден');
        error.status = 404;
        throw error;
      }

      return res.status(OK).json(user);
    } catch (err) {
      return next(err);
    }
  } catch (err) {
    return next(err);
  }
}

async function createUser(req, res, next) {
  try {
    await userSchema.validateAsync(req.body, { abortEarly: false });
    try {
      const {
        name = 'Жак-Ив Кусто', about = 'Исследователь', avatar = 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png', email, password,
      } = req.body;

      const hashedPassword = await bcrypt.hash(password, SOLT_ROUND);
      const user = new User({
        name, about, avatar, email, password: hashedPassword,
      });

      await user.save();

      const userRes = {
        _id: user._id,
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
      };

      return res.status(CREATED).json(userRes);
    } catch (err) {
      return next(err);
    }
  } catch (err) {
    return next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { name, about } = req.body;
    await updateProfileSchema.validateAsync({ name, about });

    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        const error = new Error('Пользователь не найден');
        error.status = 404;
        throw error;
      }

      user.name = name;
      user.about = about;

      await user.validate();
      await user.save();

      return res.status(OK).json(user);
    } catch (err) {
      return next(err);
    }
  } catch (err) {
    return next(err);
  }
}

async function updateAvatar(req, res, next) {
  try {
    const { avatar } = req.body;
    await updateAvatarSchema.validateAsync({ avatar });

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error('Пользователь не найден');
      error.status = 404;
      throw error;
    }

    user.avatar = avatar;

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
      const error = new Error('Пользователь не найден');
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
    await loginSchema.validateAsync({ email, password });
    const user = await User.findOne({ email }).select('+password');
    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        const token = jwt.sign({ _id: user._id }, SECRET_KEY, { expiresIn: '1w' });
        res.cookie('jwt', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
        return res.status(OK).json({ message: 'Авторизация успешна', token });
      }
      const error = new Error('Неверный пароль');
      error.status = 401;
      throw error;
    }
    const error = new Error('Пользователь не найден');
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
