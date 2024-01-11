const router = require('express').Router();
const {
  getCards,
  createCard,
  deleteCardById,
  likeCard,
  unlikeCard,
} = require('../controllers/cards');

router.get('/cards', getCards);
router.post('/cards', createCard);
router.delete('/cards/:cardId', deleteCardById);
router.put('/cards/:cardId/likes', likeCard);
router.delete('/cards/:cardId/likes', unlikeCard);

module.exports = router;
