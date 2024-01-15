const jwt = require('jsonwebtoken');
const cookie = require('cookie');

const UNAUTHORIZED = 401;
const SECRET_KEY = '123';

const authMiddleware = (req, res, next) => {
  const parsedCookies = cookie.parse(req.header('Cookie'));
  const token = parsedCookies.jwt;
  if (!token) {
    return res.status(UNAUTHORIZED).json({ message: 'Токен авторизации отсутствует' });
  }

  try {
    const payload = jwt.verify(token, SECRET_KEY);
    req.user = payload;
    res.json({ message: payload });
    return next();
  } catch (error) {
    return res.status(UNAUTHORIZED).json({ message: 'Ошибка авторизации: недействительный токен' });
  }
};

module.exports = authMiddleware;
