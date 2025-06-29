const conversationController = require('../controller/conversationController');
const Conversation = require('../models/conversation');
const Message = require('../models/message');
const User = require('../models/user');
const Product = require('../models/product');
const { isValidObjectId } = require('mongoose');

jest.mock('../models/conversation', () => {
  const m = jest.fn();
  m.find = jest.fn();
  m.findOne = jest.fn();
  m.create = jest.fn();
  return m;
});

jest.mock('../models/message');
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
  sort: jest.fn().mockReturnThis(),
  then: jest.fn((res, rej) => (error ? rej(error) : res(result)))
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getConversationsByUser', () => {
  it('returns 404 if user not found', async () => {
    const req = { params: { userId: '1' } };
    const res = mockResponse();
    User.findOne.mockResolvedValue(null);

    await conversationController.getConversationsByUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns conversations for valid user', async () => {
    const req = { params: { userId: '1' } };
    const res = mockResponse();
    const user = { _id: 'u1' };
    const convs = [{ _id: 'c1' }];
    User.findOne.mockResolvedValue(user);
    Conversation.find.mockReturnValue(mockQuery(convs));

    await conversationController.getConversationsByUser(req, res);

    expect(Conversation.find).toHaveBeenCalledWith({ participants: user._id });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, conversations: convs });
  });

  it('handles database errors', async () => {
    const req = { params: { userId: '1' } };
    const res = mockResponse();
    const user = { _id: 'u1' };
    User.findOne.mockResolvedValue(user);
    Conversation.find.mockReturnValue(mockQuery(null, new Error('fail')));

    await conversationController.getConversationsByUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('createConversation', () => {
  it('returns 404 when sender not found', async () => {
    const req = { body: { senderId: 's', receiverId: 'r' } };
    const res = mockResponse();
    User.findOne.mockResolvedValueOnce(null); // sender

    await conversationController.createConversation(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 400 for invalid product id', async () => {
    isValidObjectId.mockReturnValue(false);
    const req = { body: { senderId: 's', receiverId: 'r', productId: 'bad' } };
    const res = mockResponse();
    User.findOne.mockResolvedValueOnce({}); // sender
    User.findOne.mockResolvedValueOnce({}); // receiver

    await conversationController.createConversation(req, res);

    expect(isValidObjectId).toHaveBeenCalledWith('bad');
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when product not found', async () => {
    isValidObjectId.mockReturnValue(true);
    const req = { body: { senderId: 's', receiverId: 'r', productId: 'p' } };
    const res = mockResponse();
    User.findOne
      .mockResolvedValueOnce({}) // sender
      .mockResolvedValueOnce({}); // receiver
    Product.findById.mockResolvedValue(null);

    await conversationController.createConversation(req, res);

    expect(Product.findById).toHaveBeenCalledWith('p');
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('creates conversation and message on success', async () => {
    isValidObjectId.mockReturnValue(true);
    const req = { body: { senderId: 's', receiverId: 'r', productId: 'p', initialMessage: 'hi' } };
    const res = mockResponse();
    const sender = { _id: 'u1' };
    const receiver = { _id: 'u2' };
    const product = { _id: 'p1' };
    const conversation = { _id: 'c1', save: jest.fn() };
    const message = { _id: 'm1' };
    User.findOne
      .mockResolvedValueOnce(sender) // sender
      .mockResolvedValueOnce(receiver); // receiver
    Product.findById.mockResolvedValue(product);
    Conversation.findOne.mockResolvedValue(null);
    Conversation.create.mockResolvedValue(conversation);
    Message.create.mockResolvedValue(message);

    await conversationController.createConversation(req, res);

    expect(Conversation.create).toHaveBeenCalledWith({
      participants: [sender._id, receiver._id],
      product: product._id,
    });
    expect(Message.create).toHaveBeenCalledWith({
      conversation: conversation._id,
      sender: sender._id,
      receiver: receiver._id,
      content: 'hi',
      product: product._id,
    });
    expect(conversation.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, conversation });
  });

  it('uses existing conversation if found', async () => {
    isValidObjectId.mockReturnValue(true);
    const req = { body: { senderId: 's', receiverId: 'r', productId: 'p', initialMessage: 'hi' } };
    const res = mockResponse();
    const sender = { _id: 'u1' };
    const receiver = { _id: 'u2' };
    const product = { _id: 'p1' };
    const conversation = { _id: 'c1', save: jest.fn() };
    const message = { _id: 'm1' };
    User.findOne
      .mockResolvedValueOnce(sender)
      .mockResolvedValueOnce(receiver);
    Product.findById.mockResolvedValue(product);
    Conversation.findOne.mockResolvedValue(conversation);
    Message.create.mockResolvedValue(message);

    await conversationController.createConversation(req, res);

    expect(Conversation.create).not.toHaveBeenCalled();
    expect(Message.create).toHaveBeenCalledWith({
      conversation: conversation._id,
      sender: sender._id,
      receiver: receiver._id,
      content: 'hi',
      product: product._id,
    });
    expect(conversation.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, conversation });
  });
});