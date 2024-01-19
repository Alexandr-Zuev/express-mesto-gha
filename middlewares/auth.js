const jwt = require('jsonwebtoken');

const UNAUTHORIZED = 401;
const SECRET_KEY = '123';

function authMiddleware(req, res, next) {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(UNAUTHORIZED).json({ message: 'Токен авторизации отсутствует' });
  }
  try {
    const payload = jwt.verify(token, SECRET_KEY);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(UNAUTHORIZED).json({ message: 'Ошибка авторизации: недействительный токен' });
  }
}

module.exports = authMiddleware;
