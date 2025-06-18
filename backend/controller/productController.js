const Product = require('../models/product.js');
const User = require('../models/user.js');
//const Transaction = require('../models/transaction.js');




//productes que no pertanyen al usuari registrat
const getProducts = async (req, res) => {
  console.log('Fetch products')
    try {
      //fetch the user object
      const { clerkUserId } = req.params;
      // Find the user by clerkUserId
      const user = await User.findOne({ clerkUserId });
      if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
      }

      console.log('Found user with MongoDB ID:', user._id);

      const products = await Product.find({ seller: {$ne: user._id}})
      .populate('location.city', 'name')
      .populate('location.country', 'name');
      
      // console.log('Fetched all products:', products);
      res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
};

const createProduct = async (req, res) => {
    try {
      const { title, description, price, category, images, seller, condition } = req.body;
      console.log('Received product data:', req.body);
      //seller is the clerkUserId
  
      // Validate seller ID
      if (!seller) {
        return res.status(400).json({ success: false, message: 'Seller ID is required' });
      }
  
      // Fetch the user object
      const userSeller = await User.findOne({ clerkUserId: seller });
      console.log('User lookup result:', userSeller);
  
      if (!userSeller) {
        console.log('User not found for clerkUserId:', seller);
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const newProduct = new Product({
        title,
        description,
        price: {
          amount: price,
          currency: 'NOK',
        },
        category,
        images: images || [],
        seller: userSeller._id,
        location: {
          city: {
            _id: userSeller.city?._id,
            name: userSeller.city?.name,
          },
          country: {
            _id: userSeller.country?._id,
            name: userSeller.country?.name,
          },
        },
        condition,
        status: 'Available',
        saves: 0,
      });
  
      console.log('Product to save:', newProduct);
  
      // Save the product to the database
      await newProduct.save();
      console.log('Product saved successfully:', newProduct._id);
  
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product: newProduct,
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ success: false, message: 'Error creating product', error: error.message });
    }
  };

//get product by id
const getProductByClerkId = async (req, res) => { 
    try {
        //fetch the user object
        const { clerkUserId } = req.params;
        // Find the user by clerkUserId
        const user = await User.findOne({ clerkUserId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        console.log('Found user with MongoDB ID:', user._id);

        const products = await Product.find({ seller: user._id})
        .populate('location.city', 'name')
        .populate('location.country', 'name');

        console.log('Found products:', products);

        if (!products || products.length === 0) {
            return res.status(200).json({ success: true, products: [], message: 'No products found for this user' });
        }

        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error('Error fetching products:', error.message, error.stack);
        res.status(500).json({ success: false, message: 'Error fetching products', error: error.message });
    }
}

const getProductById = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId)
            .populate('location.city', 'name')
            .populate('location.country', 'name');
        if(!product){
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({product})
        console.log('Product by id', product)
    } catch (error) {
        res.status(500).json({ message: 'Error finding product', error });
        
    }
}

//update product by id
const updateProduct = async (req, res) => {
    try {
        console.log('Update request received:');
        console.log('Product ID:', req.params.productId);
        console.log('Request body:', req.body);
        
        const updatedProduct = await Product.findByIdAndUpdate(
          req.params.productId,
          req.body,
          { new: true }
        );
        
        console.log('Product updated:', updatedProduct);
        res.status(200).json({success: true, message: 'Product updated successfully', product: updatedProduct});
      } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ message: error.message });
      }
}

const deleteProduct = async (req, res) => {
  console.log('Delete produt called')
    try {
        const productId = req.params.productId; // URL parameter
        console.log(productId);
        const { userId } = req.body; //clerkUserId
        console.log(userId);

        if (!userId) {
            return res.status(400).json({ success: false, message: 'userId is required' });
        }
        const user = await User.findOne({ clerkUserId: userId });
        console.log(user);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const deletedProduct = await Product.findById(productId);
        console.log('Product to delete:',deletedProduct);
        if (!deletedProduct) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        if (deletedProduct.seller.toString() !== user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You are not authorized to delete this product' });
        }
        const response = await Product.findByIdAndDelete(productId);
        if(!response) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({ success: true, message: 'Product deleted successfully', deletedProduct: response });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting product', error });
    }
};



module.exports = {getProducts, createProduct, updateProduct, deleteProduct, getProductByClerkId, getProductById };