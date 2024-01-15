/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { login, createUser } = require('./controllers/users');
const authMiddleware = require('./middlewares/auth');

const { PORT = 3000, BASE_PATH } = process.env;
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/signin', login);
app.post('/signup', createUser);
app.use(authMiddleware);
app.use('/', require('./routes/users'));
app.use('/', require('./routes/cards'));

app.use((req, res) => {
  res.status(404).json({ message: 'Страница не найдена' });
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