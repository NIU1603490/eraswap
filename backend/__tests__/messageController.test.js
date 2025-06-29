const messageController = require('../controller/messageController');
const Message = require('../models/message');
const Conversation = require('../models/conversation');
const User = require('../models/user');
const Product = require('../models/product');
const { isValidObjectId } = require('mongoose');

jest.mock('../models/message', () => {
  const m = jest.fn();
  m.find = jest.fn();
  m.create = jest.fn();
  return m;
});

jest.mock('../models/conversation', () => ({
  findById: jest.fn()
}));

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
  sort: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  then: jest.fn((res, rej) => (error ? rej(error) : res(result)))
});

beforeEach(() => {
  jest.clearAllMocks();
  delete global.io;
});

// getMessagesByConversation tests

describe('getMessagesByConversation', () => {
  it('returns 400 for invalid id', async () => {
    isValidObjectId.mockReturnValue(false);
    const req = { params: { conversationId: 'x' } };
    const res = mockResponse();

    await messageController.getMessagesByConversation(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns messages on success', async () => {
    isValidObjectId.mockReturnValue(true);
    const req = { params: { conversationId: '1' } };
    const res = mockResponse();
    const msgs = [{ _id: 'm1' }];
    Message.find.mockReturnValue(mockQuery(msgs));

    await messageController.getMessagesByConversation(req, res);

    expect(Message.find).toHaveBeenCalledWith({ conversation: '1' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, messages: msgs });
  });

  it('handles database errors', async () => {
    isValidObjectId.mockReturnValue(true);
    const req = { params: { conversationId: '1' } };
    const res = mockResponse();
    Message.find.mockReturnValue(mockQuery(null, new Error('fail')));

    await messageController.getMessagesByConversation(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// sendMessage tests

describe('sendMessage', () => {
  it('returns 400 when required fields missing', async () => {
    const req = { body: {} };
    const res = mockResponse();

    await messageController.sendMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when conversation not found', async () => {
    const req = { body: { conversationId: '1', senderId: 's', receiverId: 'r', content: 'hi' } };
    const res = mockResponse();
    Conversation.findById.mockResolvedValue(null);

    await messageController.sendMessage(req, res);

    expect(Conversation.findById).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 404 when sender not found', async () => {
    const req = { body: { conversationId: '1', senderId: 's', receiverId: 'r', content: 'hi' } };
    const res = mockResponse();
    Conversation.findById.mockResolvedValue({ _id: 'c' });
    User.findOne.mockResolvedValueOnce(null);

    await messageController.sendMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 400 for invalid product id', async () => {
    isValidObjectId.mockReturnValue(false);
    const req = { body: { conversationId: '1', senderId: 's', receiverId: 'r', content: 'hi', productId: 'p' } };
    const res = mockResponse();
    Conversation.findById.mockResolvedValue({ _id: 'c' });
    User.findOne.mockResolvedValueOnce({});
    User.findOne.mockResolvedValueOnce({});

    await messageController.sendMessage(req, res);

    expect(isValidObjectId).toHaveBeenCalledWith('p');
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when product not found', async () => {
    isValidObjectId.mockReturnValue(true);
    const req = { body: { conversationId: '1', senderId: 's', receiverId: 'r', content: 'hi', productId: 'p' } };
    const res = mockResponse();
    Conversation.findById.mockResolvedValue({ _id: 'c' });
    User.findOne.mockResolvedValueOnce({});
    User.findOne.mockResolvedValueOnce({});
    Product.findById.mockResolvedValue(null);

    await messageController.sendMessage(req, res);

    expect(Product.findById).toHaveBeenCalledWith('p');
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('creates message and emits socket event', async () => {
    isValidObjectId.mockReturnValue(true);
    const req = { body: { conversationId: '1', senderId: 's', receiverId: 'r', content: 'hi', productId: 'p' } };
    const res = mockResponse();
    
    const conversation = { _id: 'c', save: jest.fn() };
    const sender = { _id: 'u1' };
    const receiver = { _id: 'u2' };
    const product = { _id: 'p1' };
    const message = { _id: 'm1', populate: jest.fn().mockResolvedValue('populated') };
    Conversation.findById.mockResolvedValue(conversation);
    User.findOne
      .mockResolvedValueOnce(sender)
      .mockResolvedValueOnce(receiver);
    Product.findById.mockResolvedValue(product);
    Message.create.mockResolvedValue(message);
    global.io = { to: jest.fn().mockReturnThis(), emit: jest.fn() };

    await messageController.sendMessage(req, res);

    expect(Message.create).toHaveBeenCalledWith({
      conversation: conversation._id,
      sender: sender._id,
      receiver: receiver._id,
      content: 'hi',
      product: product._id,
    });
    expect(conversation.save).toHaveBeenCalled();
    expect(global.io.to).toHaveBeenCalledWith('1');
    expect(global.io.emit).toHaveBeenCalledWith('newMessage', message);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, message });
  });
});