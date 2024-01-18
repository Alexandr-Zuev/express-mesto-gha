const router = require('express').Router();
const {
  celebrate, Joi, Segments,
} = require('celebrate');
const {
  getUsers, getUserById, updateProfile, updateAvatar, getMyProfile,
} = require('../controllers/users');

const avatarUpdateValidation = celebrate({
  [Segments.BODY]: {
    avatar: Joi.string().uri(),
  },
});

router.get('/', getUsers);
router.get('/me', getMyProfile);
router.get('/:userId', getUserById);
router.patch('/me', updateProfile);
router.patch('/me/avatar', avatarUpdateValidation, updateAvatar);

module.exports = router;
