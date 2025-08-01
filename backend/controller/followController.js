const Follow = require('../models/follow');
const User = require('../models/user');

const followUser = async (req, res) => {
    console.log('FOLLOW');
    //  user who wants to follow -->  follower
    //  user to be followed --> following
    try {
        const { followerId } = req.body; //  user who wants to follow
        console.log(followerId);
        const followingId = req.params.id; // user to be followed
        console.log(followingId);
        console.log('This:', followerId, 'want to follow:', followingId);
        
        // Check if the follower and following are the same
        console.log(followerId.toString() === followingId.toString())
        if (followerId.toString() === followingId.toString()) {
            return res.status(400).json({ 
                success: false,
                message: 'Follower and following cannot be the same'
            });
        }

        // Check if the user to be followed exists
        const userToFollow = await User.findOne({ _id: followingId });
        
        if (!userToFollow) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found'
            });
        }

        // Check if the user who wants to follow exists
        const followerUser = await User.findOne({ _id: followerId });
        
        if (!followerUser) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found'
            });
        }

        // Check if the follow relationship already exists
        const existingFollow = await Follow.findOne({
            follower: followerUser,
            following: userToFollow,
        });

        if (existingFollow) {
            return res.status(400).json({ 
                message: 'Already following this user'
            });
        }
        // Create a new follow relationship
        const newFollow = new Follow({
            follower: followerUser,
            following: userToFollow,
        });

        await newFollow.save();
        console.log('new follow:', newFollow);

        res.status(201).json({ 
            success: true,
            message: 'Followed successfully',
            follow: newFollow
        });
    } catch(error) {
        res.status(500).json({ 
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
}

const unfollowUser = async (req, res) => {
    console.log('UNFOLLOW');
    try {
        const { followerId } = req.body; // user who want to unfollow
        const followingId = req.params.id; // ID of the user to be unfollowed
        console.log('Follower ID:', followerId);
        console.log('Following ID:', followingId);

        // Check if the follower and following are the same
        if (followerId.toString() === followingId.toString()) {
            return res.status(400).json({ 
                success: false,
                message: 'Follower and following cannot be the same'
            });
        }

        // Check if the follow relationship exists
        console.log('Checking existing follow relationship...');
        const existingFollow = await Follow.findOne({
            follower: followerId,
            following: followingId
        });

        if (!existingFollow) {
            console.log('No existing follow relationship found');
            return res.status(404).json({ 
                success: false,
                message: 'Not following this user'
            });
        }

        console.log('Existing follow:', existingFollow);

        await Follow.deleteOne({
            follower: followerId,
            following: followingId
        });

        res.status(200).json({ 
            success: true,
            message: 'Unfollowed successfully'
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
        
    }
}

const getFollowers = async (req, res) => {
    console.log('GET FOLLOWERS');
    try { 
        const userId = req.params.id; //object id
        console.log(userId);
        const user = await User.findOne({ _id: userId});
        console.log(user);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found'
            });
        }

        const followers = await Follow.find({ following: user._id })
            .populate('follower', 'name username profilePicture ') // Populate follower details
            .sort({ createdAt: -1 }); // Sort by most recent
        
        console.log(followers); 
        res.status(200).json({
            success: true,
            count: followers.length,
            followers: followers.map(f => f.follower) // Return only the follower users
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
        
    }

}

// Get users that the user is following
const getFollowing = async (req, res) => {
    console.log('GET FOLLOWING');
    try {
        const userId = req.params.id; 
        console.log(userId);
        // Check if the user exists
        const user = await User.findOne({_id: userId});
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found'
            });
        }

        const following = await Follow.find({ follower: user._id })
            .populate('following', 'name profilePicture') // Populate following details
            .sort({ createdAt: -1 }); // Sort by most recent
        
        res.status(200).json({
            success: true,
            count: following.length,
            following: following.map(f => f.following) // Return only the following users
        });

        
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
        
    }
}


module.exports = { followUser, unfollowUser, getFollowers, getFollowing };