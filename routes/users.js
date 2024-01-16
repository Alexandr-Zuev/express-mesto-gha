const router = require('express').Router();
const {
  getUsers, getUserById, updateProfile, updateAvatar, getMyProfile,
} = require('../controllers/users');

router.get('/users', getUsers);
router.get('/users/me', getMyProfile);
router.get('/users/:userId', getUserById);
router.patch('/users/me', updateProfile);
router.patch('/users/me/avatar', updateAvatar);

module.exports = router;
