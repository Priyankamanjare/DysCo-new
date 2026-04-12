const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const SECRET = process.env.JWT_SECRET;

function generateToken( userId ) {
    return jwt.sign(
        {
            userId
        },
        SECRET,
        {expiresIn : "30d"}
    )
}

module.exports = generateToken;