const mongoose =require("mongoose");
const plm =require('passport-local-mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/picpindb");

const userSchema=mongoose.Schema({
  username:String,
  fullname:String,
  email:String,
  password:String,
  profileImage:String,
  contact:Number,
  posts:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:'post'
    }
  ]
});
userSchema.plugin(plm);
module.exports = mongoose.model("user",userSchema);
