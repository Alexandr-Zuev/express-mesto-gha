const jwt = require('jsonwebtoken');

const SECRET_KEY = '123';

function authMiddleware(req, res, next) {
  const token = req.cookies.jwt;
  if (!token) {
    const error = new Error();
    error.status = 401;
    throw error;
  }
  try {
    const payload = jwt.verify(token, SECRET_KEY);
    req.user = payload;
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = authMiddleware;
