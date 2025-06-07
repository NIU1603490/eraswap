const User = require('../models/user');
const Post = require('../models/post');

const createPost = async (req, res) => {
    try {
        const {content, images} = req.body;
        
    } catch (error) {
        
    }

}

const updatePost = async (req, res) => {
    try {
        const {content, images} = req.body;
        
    } catch (error) {
        
    }

}

const deletePost = async (req, res) => {
    try {
        const {content, images} = req.body;
        
    } catch (error) {
        
    }

}

const getAllPosts = async (req, res) => {

}

const getPostByUserId = async (req, res) => {

}

module.exports = {createPost, updatePost, deletePost, getAllPosts, getPostByUserId}