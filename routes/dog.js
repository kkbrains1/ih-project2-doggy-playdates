const express = require('express');
const Dog = require('./../models/dog');
const Breed = require('./../models/breed');
const uploader = require('./../file-uploader');
const User = require('./../models/user');

const dogRouter = new express.Router();

dogRouter.get('/create', (req, res, next) => {
  Breed.find()
  .then((breeds) => {
    res.render('dog/create', {breeds: breeds});
  })
  .catch(error => {
    next(error);
  });
});

dogRouter.post('/create', uploader.single('photo'), (req, res, next) => {
  const { name, personality, breed, size } = req.body;
  const photo = req.file.url;

  Dog.create({
    name,
    personality,
    breed,
    size,
    photo
  })
  .then((dog) => {
    return User.findByIdAndUpdate(req.session.user, {$push: {dogs: dog._id}});
  })
  .then(() => {
    res.redirect('/user/profile');
  })
  .catch(error => {
    next(error);
  });
});

module.exports = dogRouter;