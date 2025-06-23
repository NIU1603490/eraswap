const User = require('../models/user');
const Country = require('../models/country');
const City = require('../models/city');
const University = require('../models/university');
const Product = require('../models/product');
const { getAuth } = require('@clerk/express');

const { isValidObjectId } = require('mongoose');

//save user to database
const createUser = async (req, res) => {
  const { clerkUserId, firstName, lastName, username, email, country, city, university } = req.body;
  try {
    // Validate required fields
    if (!clerkUserId || !firstName || !lastName || !username || !email || !country || !city || !university) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if country, city, and university exist
    if (!isValidObjectId(country) || !isValidObjectId(city) || !isValidObjectId(university)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid country, city, or university ID',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ clerkUserId });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
      });
    }
    // Validate required fields
    const newUser = new User({
      clerkUserId,
      firstName,
      lastName,
      username,
      email,
      country,
      city,
      university,
      profilePicture: 'https://www.gravatar.com/avatar/?d=mp',
    });

    // Save the user to the database
    await newUser.save();
    res.status(201).json({ success: true, message: 'User created successfully', user: newUser });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Error creating user', error });
  }
}


//get user by clerkUserId
// router.get('/user/:clerkUserId', userController.getUser); // get a user by clerkUserId
const getUserByClerkId = async (req, res) => {
  try {
    const { userId, sessionId } = getAuth(req);
    console.log('user id', userId);
    console.log('session id', sessionId);
    const { clerkUserId } = req.params;
    if (!clerkUserId) {
      return res.status(400).json({ success: false, message: 'clerkUserId is required' });
    }
    const user = await User.findOne({ clerkUserId })
      .populate('country', 'name')
      .populate('city', 'name')
      .populate('university', 'name')

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error,
    });
  }
}

//get user by Object_id
const getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'UserId is required' });
    }
    const user = await User.findById(userId)
      .populate('country', 'name')
      .populate('city', 'name')
      .populate('university', 'name')

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error,
    });

  }
}

const getFavorites = async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    const user = await User.findOne({ clerkUserId })

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const favorites = await Product.find({ _id: { $in: user.savedProducts } })
      .populate('location.city', 'name')
      .populate('location.country', 'name');

    res.status(200).json({ success: true, favorites });

  } catch (error) {
    console.error('Error fetching favorites:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error fetching favorites', error });
  }



}



const addFavorite = async (req, res) => {
  console.log('Adding Favorite');
  // Extract clerkUserId and productId from data
  const { clerkUserId, productId } = req.body;

  try {
    const user = await User.findOne({ clerkUserId });
    console.log(user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (user.savedProducts.includes(productId)) {
      return res.status(400).json({ success: false, message: 'Product already in favorites' });
    }
    console.log('Saved Products:', user.savedProducts)

    user.savedProducts.push(product);
    await user.save();


    product.saves += 1;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product added to favorites',
      product,
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ success: false, message: 'Error adding to favorites', error });
  }
};

const removeFavorite = async (req, res) => {
  console.log('Removing Favorite');
  const { productId, clerkUserId } = req.body;

  try {
    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (!user.savedProducts.includes(productId)) {
      return res.status(400).json({ success: false, message: 'Product not in favorites' });
    }
    
    // keep all the products except the one with the productId
    user.savedProducts = user.savedProducts.filter((id) => id.toString() !== productId);
    await user.save();

    product.saves ? product.saves -= 1 : product.saves = 0;

    res.status(200).json({
      success: true,
      message: 'Product removed from favorites',
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ success: false, message: 'Error removing from favorites', error });
  }

}

const updateUser = async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    console.log(clerkUserId);
    if (!clerkUserId) {
      return res.status(400).json({ success: false, message: 'clerkUserId is required' });
    }

    const updates = req.body;

    if (updates.country) {
      if (!isValidObjectId(updates.country)) {
        return res.status(400).json({ success: false, message: 'Invalid country ID' });
      }
      const countryExists = await Country.findById(updates.country);
      if (!countryExists) {
        return res.status(404).json({ success: false, message: 'Country not found' });
      }
    }

    if (updates.city) {
      if (!isValidObjectId(updates.city)) {
        return res.status(400).json({ success: false, message: 'Invalid city ID' });
      }
      const cityExists = await City.findById(updates.city);
      if (!cityExists) {
        return res.status(404).json({ success: false, message: 'City not found' });
      }
    }

    if (updates.university) {
      if (!isValidObjectId(updates.university)) {
        return res.status(400).json({ success: false, message: 'Invalid university ID' });
      }
      const uniExists = await University.findById(updates.university);
      if (!uniExists) {
        return res.status(404).json({ success: false, message: 'University not found' });
      }
    }

    const updatedUser = await User.findOneAndUpdate(
      { clerkUserId },
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Error updating user', error: error.message });
  }
};

// Export the functions to be used in routes
module.exports = {
  createUser,
  getUser,
  getUserByClerkId,
  getFavorites,
  addFavorite,
  removeFavorite,
  updateUser,
};