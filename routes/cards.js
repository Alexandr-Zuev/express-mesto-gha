const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getCards,
  createCard,
  deleteCardById,
  likeCard,
  unlikeCard,
} = require('../controllers/cards');

const createCardValidation = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required(),
    link: Joi.string().uri({ scheme: [/https?/] }).required(),
  }),
});

const CardIdValidation = celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24).required(),
  }),
});

router.get('/', getCards);
router.post('/', createCardValidation, createCard);
router.delete('/:cardId', CardIdValidation, deleteCardById);
router.put('/:cardId/likes', CardIdValidation, likeCard);
router.delete('/:cardId/likes', CardIdValidation, unlikeCard);

module.exports = router;
