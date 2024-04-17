var express = require('express');
var router = express.Router();
const userModel=require("./users");
const postModel=require("./post");
const passport = require('passport');
const localStrategy = require("passport-local");
const upload = require('./multer');

passport.use(new localStrategy(userModel.authenticate()));

 /* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
}); 

 //register
 router.get('/register', function(req, res, next) { 
  res.render('register');
 });

router.post('/register' ,function(req, res){
  var userdata =new userModel({
    username:req.body.username,
    email:req.body.email,
    fullname:req.body.fullname,
    contact:req.body.phno
    });
    userModel.register(userdata, req.body.password)
    .then(function(registereduser){
      passport.authenticate("local")(req, res ,function(){
        res.redirect("/profile");
      })
    })
});

//login route
router.post('/login', passport.authenticate("local",{
successRedirect:"/profile",
failureRedirect:"/"}),function(req, res){});

//logout
router.get("/logout", function(req, res,next){
  req.logout(function(err){
    if(err){return next(err);}
    res.redirect('/');
  });
});
//route for upload dp
router.post('/fileupload',isLoggedIn, upload.single("image"),async function(req,res ,next){
  const user = await  userModel.findOne({username: req.session.passport.user});
  user.profileImage =req.file.filename;
  await user.save();
  res.redirect("/profile");
});

// function for authenticate user is login or not so they can not open any page without login

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}

//profile 
router.get('/profile', async function(req,res,next){
  const user = await  userModel
    .findOne({username: req.session.passport.user})
    .populate("posts")
    res.render("profile",{user});
});

//create Posts
router.post('/createpost',isLoggedIn, upload.single("postimage") ,async function(req,res,next){
 const user = await userModel.findOne({username: req.session.passport.user});
 const post= await postModel.create({
    user:user._id,
    title:req.body.title,
    description:req.body.description,
    image:req.file.filename,
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

router.get('/show/:postId',isLoggedIn, async function(req,res){
    const user = await userModel.findOne({username: req.session.passport.user})
    const posts = await postModel.find().populate("user");
    const postdata = await postModel.findOne({_id:req.params.postId})
    const postuser = await  userModel
    .findOne({_id:postdata.user})
    // console.log(user.username);
    res.render("showpost",{postdata,user,posts,postuser});
});
router.get('/feed',isLoggedIn , async function(req,res,next){
  const user = await userModel.findOne({username: req.session.passport.user})
  const posts = await postModel.find().populate("user");
  res.render("feed",{user,posts});
});
module.exports = router;

router.get('/deletePost/:postId',isLoggedIn, async function(req, res){
  const user = await userModel.findOne({username: req.session.passport.user})
  const postId = req.params.postId;
  const deletedPost = await postModel.findByIdAndDelete(postId);
  user.posts.push(postId._id);
  await user.save();
  console.log(postId);
  res.redirect("/profile");
});
