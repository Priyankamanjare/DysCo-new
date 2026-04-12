const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/userModel');

dotenv.config();
const secret = process.env.JWT_SECRET;

const authMiddleware = async(req, res, next) => {
    try {
        const token = req.header('Authorization')?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized - Missing Token"
            });
        }

        const decodedToken = jwt.verify(token, secret);
        if (!decodedToken || !decodedToken.userId) {
            return res.status(401).json({
                message: 'Unauthorized - Invalid token'
            });
        }
        
        const exisitingUser = await User.findById(decodedToken.userId);
        if(!exisitingUser) {
            return res.status(404).json({
                message : 'User not found'
            })
        }
        
        req.user = decodedToken.userId;
        
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error in authorization",
            error: error.message
        });
    }
};

module.exports = authMiddleware;