const express = require('express');
const Dog = require('./../models/dog');
const Breed = require('./../models/breed');
const uploader = require('./../file-uploader');
const User = require('./../models/user');

const dogRouter = new express.Router();

dogRouter.get('/create', (req, res, next) => {
  Breed.find()
    .then((breeds) => {
      res.render('dog/form', { breeds: breeds });
    })
    .catch((error) => {
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
      return User.findByIdAndUpdate(req.session.user, {
        $push: { dogs: dog._id }
      });
    })
    .then(() => {
      res.redirect('/user/profile');
    })
    .catch((error) => {
      next(error);
    });
});

dogRouter.get('/:id/edit', (req, res, next) => {
  const id = req.params.id;
  let dog;
  Dog.findById(id)
    .then((result) => {
      dog = result;
      return Breed.find({});
    })
    .then((breeds) => {
      res.render('dog/form', { dog, breeds });
    })
    .catch((error) => {
      next(error);
    });
});

dogRouter.post('/:id/edit', uploader.single('photo'), (req, res, next) => {
  const id = req.params.id;
  const dogData = req.body;
  if (req.file && req.file.url) {
    dogData.photo =  req.file.url;
  }

  Dog.findByIdAndUpdate(id, dogData)
    .then(() => {
      res.redirect('/user/profile');
    })
    .catch((error) => next(error));
});

dogRouter.post('/:id/delete', (req, res, next) => {
  const id = req.params.id;

  Dog.findByIdAndRemove(id)
  .then(() => {
    return User.findByIdAndUpdate(req.session.user, {
      $pull: { dogs: id }
    });
  })
  .then(() => {
    res.redirect('/user/profile');
  })
  .catch((error) => next(error));
});

module.exports = dogRouter;
