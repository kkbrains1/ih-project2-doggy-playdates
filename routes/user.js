const express = require('express');
const User = require('./../models/user');
const userRouter = new express.Router();
const Dog = require('./../models/dog');
const uploader = require('./../file-uploader');

userRouter.get('/profile', (req, res, next) => {
  const userId = req.session.user;
  let userData;

  User.findById(userId)
    .populate('dogs')
    .then((user) => {
      userData = user;
      return Dog.populate(user.dogs, { path: 'breed' });
    })
    .then((dogs) => {
      userData.dogs = dogs;
      res.render('user/profile', { user: userData });
    })
    .catch((error) => {
      next(error);
    });
});

userRouter.post('/avatar-upload', uploader.single('photo'), (req, res, next) => {
  const photoUrl = req.file.url;
  User.findByIdAndUpdate(req.session.user, {photoUrl}).then(() => {
    res.redirect('profile');
  }).catch((error) => {
    next(error);
  });
}); 

module.exports = userRouter;
