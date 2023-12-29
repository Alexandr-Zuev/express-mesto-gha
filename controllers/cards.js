const Card = require("../models/card");

async function getCards(req, res) {
  try {
    const cards = await Card.find();
    res.status(200).json(cards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createCard(req, res) {
  try {
    const newCard = new Card(req.body);
    await newCard.save();
    res.status(201).json(newCard);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function deleteCardById(req, res) {
  const { cardId } = req.params;
  try {
    const deletedCard = await Card.findByIdAndDelete(cardId);
    if (!deletedCard) {
      return res
        .status(404)
        .json({ message: "Запрашиваемая карточка не найдена" });
    }
    return res.status(200).json({ message: "Карточка успешно удалена" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getCards,
  createCard,
  deleteCardById,
};
