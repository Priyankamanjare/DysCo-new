const Card = require("../models/cardModel");
const axios = require('axios');
const dotenv = require('dotenv'); 

dotenv.config()
const CLIENT_ID = process.env.UNSPLASH_ID;

const createCard = async (req, res) => {
  try {
    const userID = req.user;
    const { name, description } = req.body; 
    const response = await axios.get(`https://api.unsplash.com/search/photos/?client_id=${CLIENT_ID}&query=${name}`)
    const imageUrl = await response?.data?.results?.[1]?.urls?.full || response?.data?.results?.[0]?.urls?.full || '';

    const card = new Card({
      name,
      description: description || '',
      imageUrl,
      user : userID,
    });

    const newCard = await card.save();

    res.status(201).json({
      message: "Card created successfully",
      newCard
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Card creation unsuccessful",
      error: error.message,
    });
  }
};

const deleteCard = async (req, res) => {
  try {
    const cardID = req.params.id;
    const card = await Card.findById(cardID);
    if (!card) {
      return res.status(404).json({
        message: "Card not found",
      });
    }

    await card.deleteOne();

    return res.status(200).json({
      message: "Card deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Card deletion unsuccessful",
      error: error.message,
    });
  }
};

const getAllCards = async (req, res) => {
  try {
    const userID = req.user;

    const cards = await Card.find({ user: userID });

    return res.status(200).json({
      message: "Cards retrieved successfully",
      cards,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching cards",
      error: error.message,
    });
  }
};

module.exports = {
  createCard,
  deleteCard,
  getAllCards,
};
