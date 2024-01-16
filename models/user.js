const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  about: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: String,
    required: true,
    validate: {
      validator: (value) => {
        const urlRegex = /^(https?|http):\/\/(?:www\.)?[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]+$/;
        return urlRegex.test(value);
      },
      message: 'Некорректный URL для аватара',
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (value) => validator.isEmail(value),
      message: 'Некорректный email',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
}, { versionKey: false, timestamps: true });

module.exports = mongoose.model('user', userSchema);
