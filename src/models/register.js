
require('dotenv').config();
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 3,
  },
  lastName: {
    type: String,
    required: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator: (value) => {
        return validator.isEmail(value);
      },
      message: "Invalid email id",
    },
  },
  password: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  option: {
    type: String,
    required: true,
  },
  zip: {
    type: Number,
    required: true,
    min: 6,
  },
  checkbox: {
    type: Boolean,
    required: true,
  },
  tokens: [{
    token: {
      type: String,
      required: true,
    }
  }]
});

// In register.js
userSchema.methods.generateToken = async function() {
  try {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.SECRET_KEY);
    
    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token; // Return the token
  } catch (error) {
    console.error('Token generation failed:', error);
    throw new Error('Token generation failed');
  }
};

// secure data using hash bcrypt
userSchema.pre("save", async function(next) {
  try {
    if (this.isModified("password")) {
      console.log(`the current password is ${this.password}`);
      this.password = await bcrypt.hash(this.password, 10);
      console.log(`the current password is ${this.password}`);
    }
    next();
  } catch (error) {
    console.error('Error during password hashing:', error);
    next(error);
  }
});

// Create the Mongoose model
const Register = mongoose.model("Register", userSchema);

module.exports = Register;
