const jwt = require('jsonwebtoken');

const SECRET_KEY = '123';

function authMiddleware(req, res, next) {
  const token = req.cookies.jwt;
  if (!token) {
    const error = new Error('Токен авторизации отсутствует');
    error.status = 401;
    return next(error);
  }
  try {
    const payload = jwt.verify(token, SECRET_KEY);
    req.user = payload;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = authMiddleware;
