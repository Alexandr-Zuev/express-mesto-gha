const mongoose = require('mongoose');
const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const ForbiddenError = require('../errors/forbidden-error');

const OK = 200;
const CREATED = 201;

async function getCards(req, res, next) {
  try {
    const cards = await Card.find();
    return res.status(OK).json(cards);
  } catch (err) {
    return next(err);
  }
}

async function createCard(req, res, next) {
  try {
    const { name, link } = req.body;
    const newCard = new Card({ name, link, owner: req.user._id });
    await newCard.validate();
    await newCard.save();

    return res.status(CREATED).json(newCard);
  } catch (err) {
    return next(err);
  }
}

async function deleteCardById(req, res, next) {
  const { cardId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    throw new BadRequestError('Удаление карточки с некорректным id карточки');
  }
  try {
    const cardToDelete = await Card.findById(cardId);
    if (!cardToDelete) {
      throw new NotFoundError('Удаление карточки с несуществующим в БД id');
    }
    if (cardToDelete.owner.toString() !== req.user._id) {
      throw new ForbiddenError('Удаление карточки другого пользователя');
    }
    const deletedCard = await Card.findByIdAndDelete(cardId);
    if (!deletedCard) {
      throw new NotFoundError('Ошибка удаление карточки');
    }
    return res.status(OK).json({ message: 'Карточка успешно удалена' });
  } catch (err) {
    return next(err);
  }
}

async function likeCard(req, res, next) {
  const { cardId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    throw new BadRequestError('Добавление лайка с некорректным id карточки');
  }
  try {
    const updatedCard = await Card.findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    );
    if (!updatedCard) {
      throw new NotFoundError('Добавление лайка с несуществующим в БД id карточки');
    }
    return res.status(OK).json(updatedCard);
  } catch (err) {
    return next(err);
  }
}

async function unlikeCard(req, res, next) {
  const { cardId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    throw new BadRequestError('Удаление лайка с некорректным id карточки');
  }
  try {
    const updatedCard = await Card.findByIdAndUpdate(
      cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    );
    if (!updatedCard) {
      throw new NotFoundError('Удаление лайка с несуществующим в БД id карточки');
    }
    return res.status(OK).json(updatedCard);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getCards,
  createCard,
  deleteCardById,
  likeCard,
  unlikeCard,
};
