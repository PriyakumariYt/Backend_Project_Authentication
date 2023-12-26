const mongoose = require("mongoose");
const validator = require ("validator");
userSchema = mongoose.Schema({
    email:{
    type:String,
    required:true,
    validator(value){
        if(!validator.isEmail(value)){
            throw new Error("invalid email id")
        }
    }
    },
  })
// we need collections
const Email = mongoose.model("Email",userSchema)

module.exports = Email; 