const Follow = require('../models/follow');
const User = require('../models/user');

const followUser = async (req, res) => {
    console.log('FOLLOW')
    try {
        const { followerId } = req.body; //  user who wants to follow
        const followingId = req.params.id; // ID of the user to be followed
        consolr.log('This:', followerId, 'want to follow:', followingId)
        // Check if the follower and following are the same
        if (followerId.toString() === followingId) {
            return res.status(400).json({ 
                success: false,
                message: 'Follower and following cannot be the same'
            });
        }

        // Check if the user to be followed exists
        const userToFollow = await User.findById(followingId);
        if (!userToFollow) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found'
            });
        }

        // Check if the follow relationship already exists
        const existingFollow = await Follow.findOne({
            follower: followerId,
            following: followingId
        });
        if (existingFollow) {
            return res.status(400).json({ 
                success: false,
                message: 'Already following this user'
            });
        }

        // Create a new follow relationship
        const newFollow = new Follow({
            follower: followerId,
            following: followingId
        });
        await newFollow.save();

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
    try {
        const { followerId } = req.body; // user who want to unfollow
        const followingId = req.params.id; // ID of the user to be unfollowed

        // Check if the follower and following are the same
        if (followerId.toString() === followingId) {
            return res.status(400).json({ 
                success: false,
                message: 'Follower and following cannot be the same'
            });
        }

        // Check if the follow relationship exists
        const existingFollow = await Follow.findOne({
            follower: followerId,
            following: followingId
        });
        if (!existingFollow) {
            return res.status(404).json({ 
                success: false,
                message: 'Not following this user'
            });
        }

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
    try {
        const { userId } = req.params.id; 
        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found'
            });
        }

        const followers = await Follow.find({ following: userId })
            .populate('follower', 'name profilePicture ') // Populate follower details
            .sort({ createdAt: -1 }); // Sort by most recent

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
    try {
        const { userId } = req.params.id; 

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found'
            });
        }

        const following = await Follow.find({ follower: userId })
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