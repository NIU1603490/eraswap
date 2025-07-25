//REVISADO
const postController = require('../controller/postController');
const User = require('../models/user');
const Post = require('../models/post');

jest.mock('../models/user');
jest.mock('../models/post', () => {
    const m = jest.fn();
    m.findByIdAndUpdate = jest.fn();
    m.findById = jest.fn();
    return m;
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('createPost', () => {

  it('returns 400 if required fields missing', async () => {
    const req = { body: { content: '', userId: '' } };
    const res = mockResponse();

    await postController.createPost(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when user not found', async () => {
    const req = { body: { content: 'msg', userId: '1' } };
    const res = mockResponse();
    User.findOne.mockResolvedValue(null);

    await postController.createPost(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ clerkUserId: '1' });
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('creates post and returns 201 on success', async () => {
    const user = { _id: 'abc' };
    const req = { body: { content: 'text', userId: '1', image: 'img' } };
    const res = mockResponse();
    User.findOne.mockResolvedValue(user);
    const saveMock = jest.fn().mockResolvedValue({});
    Post.mockImplementation(() => ({ save: saveMock }));

    await postController.createPost(req, res);

    expect(Post).toHaveBeenCalledWith({
      author: 'abc',
      content: 'text',
      image: 'img'
    });
    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('handles errors when saving post', async () => {
    const user = { _id: 'abc' };
    const req = { body: { content: 'text', userId: '1' } };
    const res = mockResponse();
    User.findOne.mockResolvedValue(user);
    const saveMock = jest.fn().mockRejectedValue(new Error('fail'));
    Post.mockImplementation(() => ({ save: saveMock }));

    await postController.createPost(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
