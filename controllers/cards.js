const mongoose = require('mongoose');
const Card = require('../models/card');

async function getCards(req, res) {
  try {
    const cards = await Card.find();
    res.status(200).json(cards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createCard(req, res) {
  let response;
  try {
    const newCard = new Card({ name: req.body.name, link: req.body.link, owner: req.user._id });
    await newCard.validate();

    await newCard.save();
    response = res.status(201).json(newCard);
  } catch (err) {
    if (err.name === 'ValidationError') {
      response = res.status(400).json({ message: 'Ошибка валидации данных карточки' });
    } else {
      response = res.status(404).json({ message: err.message });
    }
  }

  return response;
}

async function deleteCardById(req, res) {
  const { cardId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return res.status(400).json({ message: 'Некорректный ID карточки' });
  }

  try {
    const deletedCard = await Card.findByIdAndDelete(cardId);
    if (!deletedCard) {
      return res.status(404).json({ message: 'Запрашиваемая карточка не найдена' });
    }
    return res.status(200).json({ message: 'Карточка успешно удалена' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function likeCard(req, res) {
  const { cardId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return res.status(400).json({ message: 'Некорректный ID карточки' });
  }

  try {
    const updatedCard = await Card.findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    );

    if (!updatedCard) {
      return res.status(404).json({ message: 'Карточка не найдена' });
    }

    return res.status(200).json(updatedCard);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function unlikeCard(req, res) {
  const { cardId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return res.status(400).json({ message: 'Некорректный ID карточки' });
  }

  try {
    const updatedCard = await Card.findByIdAndUpdate(
      cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    );

    if (!updatedCard) {
      return res.status(404).json({ message: 'Карточка не найдена' });
    }

    return res.status(200).json(updatedCard);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getCards,
  createCard,
  deleteCardById,
  likeCard,
  unlikeCard,
};
