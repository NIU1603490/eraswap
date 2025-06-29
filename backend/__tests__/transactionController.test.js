const transactionController = require('../controller/transactionController');
const Transaction = require('../models/transaction');
const User = require('../models/user');
const Product = require('../models/product');
const { isValidObjectId } = require('mongoose');


jest.mock('../models/transaction', () => {
    const m = jest.fn();
    m.create = jest.fn();
    m.findById = jest.fn();
    m.find = jest.fn();
    m.findByIdAndUpdate = jest.fn();
    return m;
});

jest.mock('../models/user');
jest.mock('../models/product');

jest.mock('mongoose', () => {
    const actual = jest.requireActual('mongoose');
    return { ...actual, isValidObjectId: jest.fn() };
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockQuery = (result, error) => ({
    populate: jest.fn().mockReturnThis(),
    then: jest.fn((res, rej) => (error ? rej(error) : res(result)))
});

beforeEach(() => {
  jest.clearAllMocks();
})

describe('createTransaction', () => {
    it('return 400 when required fields misssing', async () => {
        const req = { body: {} };
        const res = mockResponse();

        await transactionController.createTransaction(req, res);
        expect(res.status).toHaveBeenCalledWith(400);

    });

    it('return 400 for invalid product id', async () => {
        const req = { body: { buyer: 'b', product: 'p', seller: 's' } };
        const res = mockResponse();

        await transactionController.createTransaction(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(isValidObjectId).toHaveBeenCalledWith('p');
    })

    it('creates transaction successfully', async () => {
        isValidObjectId.mockReturnValue(true);
        const req = { body: { buyer: 'b', product: 'p', seller: 's', price: 4 } };
        const res = mockResponse();

        const buyer = { _id: 'b1' };
        const seller = { _id: 's1' };
        const product = { _id: 'p1' };
        const transaction = { _id: 't1' };


        User.findOne.mockReturnValueOnce(buyer);
        User.findOne.mockReturnValueOnce(seller);
        Product.findById.mockReturnValue(mockQuery(product));
        Transaction.create.mockResolvedValue(transaction);
        Product.findByIdAndUpdate.mockResolvedValue({})

        await transactionController.createTransaction(req, res);
        expect(Transaction.create).toHaveBeenCalledWith({
            buyer: buyer._id,
            product: product._id,
            seller: seller._id,
            price: 4,
            status: undefined,
            paymentMethod: undefined,
            deliveryMethod: undefined,
            meetingDate: undefined,
            meetingTime: undefined,
            meetingLocation: undefined,
            messageToSeller: undefined
        });
        expect(Product.findByIdAndUpdate).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);

    })
});

describe('getTransactionById', () => {
    it('returns 400 for invalid  id', async () => {
        const req = { params: { id: '1' } };
        const res = mockResponse();

        isValidObjectId.mockReturnValue(false);
        await transactionController.getTransactionById(req, res);
        expect(res.status).toHaveBeenCalledWith(400);

    })

    it('returns 404 when transaction not found', async () => {
        const req = { params: { id: '1' } };
        const res = mockResponse();

        isValidObjectId.mockReturnValue(true);
        Transaction.findById.mockReturnValue(mockQuery(null));


        await transactionController.getTransactionById(req, res);

        expect(Transaction.findById).toHaveBeenCalledWith('1');
        expect(res.status).toHaveBeenCalledWith(404);

    })

    it('returns transaction on success', async () => {
        const req = { params: { id: '1' } };
        const res = mockResponse();

        isValidObjectId.mockReturnValue(true);

        const trans = { _id: 't' };
        Transaction.findById.mockReturnValue(mockQuery(trans));

        await transactionController.getTransactionById(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, data: trans });

    })

})

describe('getTransactionsByBuyerId', () => {
    it('returns 404 when user not found', async () => {
        const req = { params: { userId: '1' } };
        const res = mockResponse();
        User.findOne.mockResolvedValue(null);

        await transactionController.getTransactionsByBuyerId(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns transactions for user', async () => {
        const req = { params: { userId: '1' } };
        const res = mockResponse();
        const user = { _id: 'u' };
        const transactions = [{ _id: 't1' }];
        User.findOne.mockResolvedValue(user);
        Transaction.find.mockReturnValue(mockQuery(transactions));

        await transactionController.getTransactionsByBuyerId(req, res);

        expect(Transaction.find).toHaveBeenCalledWith({ buyer: user._id });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, data: transactions });
    });

});

describe('updateTransaction', () => {
    it('returns 404 when transaction not found', async () => {
        const req = { params: { transactionId: '1' }, body: { status: 'Completed' } };
        const res = mockResponse();
        Transaction.findByIdAndUpdate.mockResolvedValue(null);

        await transactionController.updateTransaction(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('updates transaction and product status', async () => {
    const req = { params: { transactionId: '1' }, body: { status: 'Completed' } };
    const res = mockResponse();

    const updated = { product: { _id: 'p1' } };
    Transaction.findByIdAndUpdate.mockResolvedValue(updated);
    Product.findByIdAndUpdate.mockResolvedValue({});

    await transactionController.updateTransaction(req, res);

    expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
      'p1',
      { status: 'Sold' },
      { new: true, runValidators: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Transaction updated successfully'
    });
  });

})