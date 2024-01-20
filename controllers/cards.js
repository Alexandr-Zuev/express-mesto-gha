const mongoose = require('mongoose');
const Card = require('../models/card');

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
    const error = new Error('Удаление карточки с некорректным id карточки');
    error.status = 400;
    throw error;
  }
  try {
    const cardToDelete = await Card.findById(cardId);
    if (!cardToDelete) {
      const error = new Error('Удаление карточки с несуществующим в БД id');
      error.status = 404;
      throw error;
    }
    if (cardToDelete.owner.toString() !== req.user._id) {
      const error = new Error('Удаление карточки другого пользователя');
      error.status = 403;
      throw error;
    }
    const deletedCard = await Card.findByIdAndDelete(cardId);
    if (!deletedCard) {
      const error = new Error('Ошибка удаление карточки');
      error.status = 404;
      throw error;
    }
    return res.status(OK).json({ message: 'Карточка успешно удалена' });
  } catch (err) {
    return next(err);
  }
}

async function likeCard(req, res, next) {
  const { cardId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    const error = new Error('Добавление лайка с некорректным id карточки');
    error.status = 400;
    throw error;
  }
  try {
    const updatedCard = await Card.findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    );
    if (!updatedCard) {
      const error = new Error('Добавление лайка с несуществующим в БД id карточки');
      error.status = 404;
      throw error;
    }
    return res.status(OK).json(updatedCard);
  } catch (err) {
    return next(err);
  }
}

async function unlikeCard(req, res, next) {
  const { cardId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    const error = new Error('Удаление лайка с некорректным id карточки');
    error.status = 400;
    throw error;
  }
  try {
    const updatedCard = await Card.findByIdAndUpdate(
      cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    );
    if (!updatedCard) {
      const error = new Error('Удаление лайка с несуществующим в БД id карточки');
      error.status = 404;
      throw error;
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
