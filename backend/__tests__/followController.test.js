const followController = require('../controller/followController');
const Follow = require('../models/follow');
const User = require('../models/user');

jest.mock('../models/follow', () => {
    const m = jest.fn();
    m.findOne = jest.fn();
    m.find = jest.fn();
    m.deleteOne = jest.fn();
    return m;
});

jest.mock('../models/user');

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
})

describe('followUser', () => {
    it('returns 400 when same ids', async () => {
        const req = { body: { followerId: '1' }, params: { id: '1' } };
        const res = mockResponse();

        await followController.followUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 400 when already following', async () => {
        const req = { body: { followerId: 'a' }, params: { id: 'b' } };
        const res = mockResponse();
        const follower = { _id: 'a' };
        const following = { _id: 'b' };
        User.findOne
            .mockResolvedValueOnce(following)
            .mockResolvedValueOnce(follower);
        Follow.findOne.mockResolvedValue({});

        await followController.followUser(req, res);

        expect(Follow.findOne).toHaveBeenCalledWith({ follower, following });
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('creates follow when valid', async () => {
        const req = { body: { followerId: 'a' }, params: { id: 'b' } };
        const res = mockResponse();
        const follower = { _id: 'a' };
        const following = { _id: 'b' };
        const save = jest.fn().mockResolvedValue({});
        let newFollow;
        Follow.mockImplementation(data => { newFollow = { ...data, save }; return newFollow; });
        User.findOne
            .mockResolvedValueOnce(following)
            .mockResolvedValueOnce(follower);


        Follow.findOne.mockResolvedValue(null);

        await followController.followUser(req, res);

        expect(newFollow).toMatchObject({ follower, following });
        expect(save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Followed successfully', follow: newFollow });
    });

});

describe('unfollowUser', () => {
    it('returns 400 when ids match', async () => {
        const req = { body: { followerId: '1' }, params: { id: '1' } };
        const res = mockResponse();

        await followController.unfollowUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deletes follow and returns 200', async () => {
        const req = { body: { followerId: 'a' }, params: { id: 'b' } };
        const res = mockResponse();
        Follow.findOne.mockResolvedValue({});
        Follow.deleteOne.mockResolvedValue({});

        await followController.unfollowUser(req, res);

        expect(Follow.deleteOne).toHaveBeenCalledWith({ follower: 'a', following: 'b' });
        expect(res.status).toHaveBeenCalledWith(200);
    })

});

describe('getFollowers', () => {
    it('returns 404 when user not found', async () => {
    const req = { params: { id: '1' } };
    const res = mockResponse();
    User.findOne.mockResolvedValue(null);

    await followController.getFollowers(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: '1' });
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns followers list', async () => {
    const req = { params: { id: '1' } };
    const res = mockResponse();

    const user = { _id: 'u' };
    const followers = [{ follower: {name: 'u'}}];

    User.findOne.mockResolvedValue(user);

    Follow.find.mockReturnValue(mockQuery(followers));
    

    await followController.getFollowers(req, res);
    expect(Follow.find).toHaveBeenCalledWith({ following: user._id });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, count: followers.length, followers: [followers[0].follower] });
  });

});

describe('getFollowing', () => {
    it('returns 404 when user not found', async () => {
    const req = { params: { id: '1' } };
    const res = mockResponse();
    User.findOne.mockResolvedValue(null);

    await followController.getFollowing(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns following list', async () => {
    const req = { params: { id: '1' } };
    const res = mockResponse();

    const user = { _id: 'u' };
    const following = [{ following: { name: 'n' } }];
    User.findOne.mockResolvedValue(user);
    Follow.find.mockReturnValue(mockQuery(following));
    

    await followController.getFollowing(req, res);

    expect(Follow.find).toHaveBeenCalledWith({ follower: user._id });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, count: following.length, following: [following[0].following] });
  });

});