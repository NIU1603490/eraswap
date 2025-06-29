//REVISADO

jest.mock('../models/user', () => {
  const m = jest.fn();
  m.findOne = jest.fn();
  m.findById = jest.fn();
  m.findOneAndUpdate = jest.fn();
  return m;
});


jest.mock('../models/country');
jest.mock('../models/city');
jest.mock('../models/university');
jest.mock('../models/product');

// mocking Clerk's getAuth function and mongoose's isValidObjectId
jest.mock('@clerk/express', () => ({ getAuth: jest.fn() }));
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return { ...actual, isValidObjectId: jest.fn() };
});

const userController = require('../controller/userController');
const User = require('../models/user');
const Country = require('../models/country');
const City = require('../models/city');
const University = require('../models/university');
const Product = require('../models/product');
const { getAuth } = require('@clerk/express');
const { isValidObjectId } = require('mongoose');


//simulate the response of express
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// mock query response for mongoose
// this simulates the behavior of mongoose queries
const mockQuery = (result, error) => ({
  populate: jest.fn().mockReturnThis(),
  then: jest.fn((res, rej) => (error ? rej(error) : res(result)))
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('createUser', () => {
  it('returns 400 when fields missing', async () => {
    const req = { body: {} };
    const res = mockResponse();

    await userController.createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 for invalid ids', async () => {
    isValidObjectId.mockReturnValue(false);
    //mock invalid ids
    const req = { body: { clerkUserId: '1', firstName: 'a', lastName: 'b', username: 'u', email: 'e', country: '1', city: '2', university: '3' } };
    const res = mockResponse();

    await userController.createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 409 if user exists', async () => {
    isValidObjectId.mockReturnValue(true);

    User.findOne.mockReturnValue(mockQuery({}));

    const req = { body: { 
      clerkUserId: 'user_2z5ih9tO2Oe1FbezutiuXNVPf9S', 
      firstName: 'user', 
      lastName: 'example', 
      username: 'user_example', 
      email: 'user@example.com', 
      country: '680b56ebef65b11b78aa296c', 
      city: '680b56ebef65b11b78aa2977', 
      university: '680b56ebef65b11b78aa2983' } 
    };
    const res = mockResponse();

    await userController.createUser(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ clerkUserId: 'user_2z5ih9tO2Oe1FbezutiuXNVPf9S' });
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('creates user and returns 201', async () => {
    //force to be validobject true
    //always return true
    isValidObjectId.mockReturnValue(true);

    //simulate not user found
    User.findOne.mockReturnValue(mockQuery(null));

    //simulate the function save
    //resolve to empty object
    const save = jest.fn().mockResolvedValue({}); 
    let created; //
    User.mockImplementation(data =>
      { created = data; //data for the constructor of User
        return { save }; //i retornem un mock que té el mètode save()
      }); //

    const req = { body: { clerkUserId: '1', firstName: 'a', lastName: 'b', username: 'u', email: 'e', country: '1', city: '2', university: '3' } };
    const res = mockResponse();

    await userController.createUser(req, res);

    expect(created).toMatchObject({ clerkUserId: '1', firstName: 'a', lastName: 'b', username: 'u', email: 'e', country: '1', city: '2', university: '3', profilePicture: 'https://www.gravatar.com/avatar/?d=mp' });
    expect(save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe('getUserByClerkId', () => {
  it('returns 400 when param missing', async () => {
    const req = { params: {} };
    const res = mockResponse();

    getAuth.mockReturnValue({});

    await userController.getUserByClerkId(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns user on success', async () => {
    //simulate user authenticated
    getAuth.mockReturnValue({ userId: 'u', sessionId: 's' });
    
    //simulem user found 
    const user = { name: 'user' };

    User.findOne.mockReturnValue(mockQuery(user));
    const req = { params: { clerkUserId: '1' } };
    const res = mockResponse();

    await userController.getUserByClerkId(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ clerkUserId: '1' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, user });
  });

});

describe('updateUser', () => {
  it('returns 400 for invalid country id', async () => {
    const req = { params: { clerkUserId: '1' }, body: { country: 'bad' } };
    const res = mockResponse();

    //simulate invalid objectId
    isValidObjectId.mockReturnValue(false);

    await userController.updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 if user not found', async () => {
    const req = { params: { clerkUserId: '1' }, body: {} };
    const res = mockResponse();
    isValidObjectId.mockReturnValue(true);

    //simulate there is no user with this clerkId
    User.findOneAndUpdate.mockReturnValue(mockQuery(null));

    await userController.updateUser(req, res);

    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { clerkUserId: '1' }, 
      {}, 
      { new: true, runValidators: true });

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('updates user and returns 200', async () => {
    const updated = { username: 'new' };
    const req = { params: { clerkUserId: '1' }, body: { username: 'new' } };
    const res = mockResponse();
    isValidObjectId.mockReturnValue(true);

    //validate 
    Country.findById.mockReturnValue(mockQuery({}));
    City.findById.mockReturnValue(mockQuery({}));
    University.findById.mockReturnValue(mockQuery({}));

    //simulate update
    User.findOneAndUpdate.mockReturnValue(mockQuery(updated));

    await userController.updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, user: updated });
  });
});