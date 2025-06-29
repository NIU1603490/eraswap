const User = require('../models/user');
const Post = require('../models/post');

const createPost = async (req, res) => {
    try {
        const { content, image, userId } = req.body;

        if (!content || !userId) {
            return res.status(400).json({ success: false, message: 'content and userId are required' });
        }

        const user = await User.findOne({ clerkUserId: userId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const post = new Post({
            author: user._id,
            content,
            image: image || ''
        });

        await post.save();

        res.status(201).json({ success: true, post });
        
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating post', error: error.message })
    }

};

const updatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const updates = req.body;

        const updatedPost = await Post.findByIdAndUpdate(postId, updates, { new: true });
        if (!updatedPost) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        res.status(200).json({ success: true, post: updatedPost });
        
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating post', error: error.message });
        
    }

};

const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;

        const deletedPost = await Post.findByIdAndDelete(postId);
        if (!deletedPost) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        res.status(200).json({ success: true, post: deletedPost });
        
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting post', error: error.message });
    }

};

const getAllPosts = async (req, res) => {
    try {
        console.log('GET ALL POST');
        console.log(req.query);
        const  countryId  = req.query.countryId;
        console.log('countryId', countryId);
        const posts = await Post.find()
            .populate('author', 'firstName lastName username profilePicture country')
            .sort({ createdAt: -1 }); // sort by creation date, newest first
        
        console.log(posts);
        //priority 1 
        //priority 0 --> with the same country
        if(countryId) {
            posts.sort((a,b) => {
                const aPriority = a.author.country._id.toString() === countryId ? 0 : 1;
                const bPriority = b.author.country._id.toString() === countryId ? 0 : 1;

                if(aPriority !== bPriority) {
                    // res = -1 --> put firt a
                    // res = +1 --> put b first
                    return aPriority - bPriority
                }
                return new Date(b.createdAt) - new Date(a.createdAt);

            })
        }
        res.status(200).json({ success: true, posts });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching posts', error: error.message });
    }

};

const getPostByUserId = async (req, res) => {
    try {
        const { clerkUserId } = req.params;
        const user = await User.findOne({ clerkUserId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const posts = await Post.find({ author: user._id })
            .populate('author', 'firstName lastName username profilePicture')
            .sort({ createdAt: -1 }); // sort by creation date, newest first

        res.status(200).json({ success: true, posts });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching posts', error: error.message });
    }

};

const likePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findByIdAndUpdate(postId, { $inc: { likes: 1 } }, { new: true });
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
        res.status(200).json({ success: true, post });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error liking post', error: error.message });
    }
};

const unlikePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
        if (post.likes > 0) {
            post.likes -= 1;
            await post.save();
        }
        res.status(200).json({ success: true, post });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error unliking post', error: error.message });
    }
};

module.exports = {createPost, updatePost, deletePost, getAllPosts, getPostByUserId, likePost, unlikePost};