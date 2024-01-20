/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
const path = require('path');
const express = require('express');
const { celebrate, Joi } = require('celebrate');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const { login, createUser } = require('./controllers/users');
const authMiddleware = require('./middlewares/auth');

const ERROR_CODE = 400;
const UNAUTHORIZED = 401;
const FORBIDDEN = 403;
const NOT_FOUND = 404;
const CONFLICT = 409;
const SERVER_ERROR = 500;

function errorHandler(err, req, res, next) {
  console.log(err);
  if (err.name === 'ValidationError') {
    return res.status(ERROR_CODE).json({ message: 'Ошибка валидации данных пользователя' });
  }
  if (err.name === 'CastError' || err.status === 400) {
    return res.status(ERROR_CODE).json({ message: 'Некорректный формат идентификатора пользователя' });
  }
  if (err.status === 401) {
    return res.status(UNAUTHORIZED).json({ message: 'Ошибка авторизации' });
  }
  if (err.status === 403) {
    return res.status(FORBIDDEN).json({ message: 'Вы не можете удалить карточку другого пользователя' });
  }
  if (err.status === 404) {
    return res.status(NOT_FOUND).json({ message: 'Данные не найдены' });
  }
  if (err.code === 11000) {
    return res.status(CONFLICT).json({ message: 'Пользователь с таким email уже существует' });
  }
  return res.status(SERVER_ERROR).json({ message: 'На сервере произошла ошибка' });
}

const createUserValidation = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().uri(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
});

const loginValidation = celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
});

const { PORT = 3000 } = process.env;
const app = express();

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Ошибка подключения к MongoDB:'));
db.once('open', () => {
  console.log('Успешное подключение к MongoDB');
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/signin', loginValidation, login);
app.post('/signup', createUserValidation, createUser);
app.use(authMiddleware);
app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.use((req, res) => {
  res.status(NOT_FOUND).json({ message: 'Страница не найдена' });
});

app.use(errors());
app.use(errorHandler);
