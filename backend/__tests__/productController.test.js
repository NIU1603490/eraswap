const productController = require('../controller/productController');
const Product = require('../models/product');
const User = require('../models/user');

jest.mock('../models/user');

jest.mock('../models/product', () => {
  const m = jest.fn();
  m.find = jest.fn();
  m.findById = jest.fn();
  m.findByIdAndUpdate = jest.fn();
  m.findByIdAndDelete = jest.fn();
  return m;
});


//simulate the response of express
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

const mockQuery = (result, error)=> ({
    populate: jest.fn().mockReturnThis(), 
    then: jest.fn((res, rej)=> (error ? rej(error) : res(result))),
})

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getProducts', () => {
    it('returns 404 when user not found', async () => {
        const req = { params: { clerkUserId: '12345' } };
        const res = mockResponse();
        User.findOne.mockResolvedValue(null); // simulate user not found

        await productController.getProducts(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns products for valid user', async () => {
    const req = { params: { clerkUserId: 'user_2wwkTPfuGMTb9LmLV8OzIoo4c0W' } };
    const res = mockResponse();
    const user = { _id: '68207ea00fb2ea508d682f6e' };
    const products = [{ title: 'Book' }];
    User.findOne.mockResolvedValue(user);
    Product.find.mockReturnValue(mockQuery(products));

    await productController.getProducts(req, res);

    expect(Product.find).toHaveBeenCalledWith({ seller: { $ne: user._id } });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(products);
  });
});


describe('createProduct', () => {
    it('returns 400 if seller is missing', async () => {
        const req = { body: { title: 'Test Product' } };
        const res = mockResponse();

        await productController.createProduct(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });


    it('creates a new product successfully', async () => {
        const user = { _id: '68207ea00fb2ea508d682f6e', city: { _id: '680b56ebef65b11b78aa2977', name: 'Berlin' }, country: { _id: '680b56ebef65b11b78aa296c', name: 'Germany' } };
        User.findOne.mockResolvedValue(user); // simulate user found
        const save = jest.fn().mockResolvedValue({}); // simulate product save
        let created;
        Product.mockImplementation(data => { created = data; return { save }; });

        const req = {
            body: {
                title: 'Test Product',
                description: 'A great product',
                price: 100,
                category: 'Electronics',
                images: ['image1.jpg'],
                seller: 'user_2wwkTPfuGMTb9LmLV8OzIoo4c0W'
            }
        };
        const res = mockResponse();
        const userSeller = { _id: '68207ea00fb2ea508d682f6e', city: { _id: 'cityId', name: 'City' }, country: { _id: 'countryId', name: 'Country' } };
        
        User.findOne.mockResolvedValue(userSeller); // simulate user found
        Product.prototype.save = jest.fn().mockResolvedValue({}); // simulate product save

        await productController.createProduct(req, res);

        expect(created).toMatchObject({
            title: 'Test Product',
            description: 'A great product',
            price: { amount: 100, currency: 'NOK' },
            category: 'Electronics',
            images: ['image1.jpg'],
            seller: user._id,
            location: {
                city: { _id: userSeller.city._id, name: userSeller.city.name },
                country: { _id: userSeller.country._id, name: userSeller.country.name }
            },
            condition: 'New',
            status: 'Available',
            saves: 0
        })

        expect(save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
    });
});

describe('getProductById', () => {
    it('returns 404 when user not found', async () => {
    const req = { params: { clerkUserId: '1' } };
    const res = mockResponse();
    User.findOne.mockResolvedValue(null);

    await productController.getProductByClerkId(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns empty list when no products', async () => {
    const user = { _id: '68207ea00fb2ea508d682f6e' };
    User.findOne.mockResolvedValue(user);
    Product.find.mockReturnValue(mockQuery([]));
    const req = { params: { clerkUserId: 'user_2wwkTPfuGMTb9LmLV8OzIoo4c0W' } };
    const res = mockResponse();
    await productController.getProductByClerkId(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, products: [], message: 'No products found for this user'});
    });


    it('returns products for user', async () => {
        const user = { _id: '68207ea00fb2ea508d682f6e' };
        const products = [{ title: 'Test Product' }];
        User.findOne.mockResolvedValue(user);
        Product.find.mockReturnValue(mockQuery(products));

        const req = { params: { clerkUserId: 'user_2wwkTPfuGMTb9LmLV8OzIoo4c0W' } };
        const res = mockResponse();

        await productController.getProductByClerkId(req, res);

        expect(Product.find).toHaveBeenCalledWith({ seller: user._id });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, products });
    })

});