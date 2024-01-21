const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-error');

const SECRET_KEY = '123';

function authMiddleware(req, res, next) {
  const token = req.cookies.jwt;
  if (!token) {
    return next(new UnauthorizedError('Токен авторизации отсутствует'));
  }
  try {
    const payload = jwt.verify(token, SECRET_KEY);
    req.user = payload;
    return next();
  } catch (error) {
    return next(new UnauthorizedError('Неверный токен'));
  }
}

module.exports = authMiddleware;
