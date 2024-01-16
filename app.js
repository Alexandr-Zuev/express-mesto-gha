/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { login, createUser } = require('./controllers/users');
const authMiddleware = require('./middlewares/auth');

const ERROR_CODE = 400;
const UNAUTHORIZED = 401;
const NOT_FOUND = 404;
const SERVER_ERROR = 500;

function errorHandler(err, req, res, next) {
  console.log(err.name);
  if (err.name === 'ValidationError') {
    return res.status(ERROR_CODE).json({ message: 'Ошибка валидации данных пользователя' });
  }
  if (err.name === 'CastError') {
    return res.status(ERROR_CODE).json({ message: 'Некорректный формат идентификатора пользователя' });
  }
  if (err.code === 401) {
    return res.status(UNAUTHORIZED).json({ message: 'Ошибка авторизации' });
  }
  if (err.code === 11000) {
    return res.status(ERROR_CODE).json({ message: 'Пользователь с таким email уже существует' });
  }
  return res.status(SERVER_ERROR).json({ message: 'На сервере произошла ошибка' });
}

const { PORT = 3000, BASE_PATH } = process.env;
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/signin', login);
app.post('/signup', createUser);
app.use(authMiddleware);
app.use('/', require('./routes/users'));
app.use('/', require('./routes/cards'));

app.use(errorHandler);
app.use((req, res) => {
  res.status(NOT_FOUND).json({ message: 'Страница не найдена' });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Ошибка подключения к MongoDB:'));
db.once('open', () => {
  console.log('Успешное подключение к MongoDB');
});

module.exports.createCard = (req, res) => {
  console.log(req.user._id);
};
