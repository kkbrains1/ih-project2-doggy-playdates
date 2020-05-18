const express = require('express');
const User = require('./../models/user');
const userRouter = new express.Router();
const Dog = require('./../models/dog');
const Breed = require('./../models/breed');

userRouter.get('/:id', (req, res, next) => {
  const userId = req.params.id;

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

module.exports = userRouter;
