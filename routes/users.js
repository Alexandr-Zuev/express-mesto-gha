const router = require('express').Router();
const {
  getUsers, getUserById, updateProfile, updateAvatar, getMyProfile,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/me', getMyProfile);
router.get('/:userId', getUserById);
router.patch('/me', updateProfile);
router.patch('/me/avatar', updateAvatar);

module.exports = router;
