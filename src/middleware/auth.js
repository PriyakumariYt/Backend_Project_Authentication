const jwt = require("jsonwebtoken");
const Register = require("../models/register"); 

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    // Check if token is present
    if (!token) {
      return res.status(401).send('Token not provided');
    }

    const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
    
    // Assuming `findOne` is a method defined in your Register model
    const user = await Register.findOne({ _id: verifyUser._id }); 

    // Check if user exists
    if (!user) {
      return res.status(401).send('User not found');
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).send('Token has expired');
    }

    console.error('Authentication error:', error);
    res.status(401).send(error.message || 'Unauthorized');
  }
};

module.exports = auth;

