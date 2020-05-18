'use strict';

const { Router } = require('express');

const bcryptjs = require('bcryptjs');
const User = require('./../models/user');
const Breed = require('./../models/breed');
const Dog = require('./../models/dog');

const router = new Router();

router.get('/sign-up', (req, res, next) => {
  Breed.find()
    .then((breeds) => {
      const teste = breeds.map((b) => {
        //console.log('ola: ', b);
        return { _id: 'teste', breed: b.breed };
      });
      //console.log(teste);
      //console.log(breeds);
      res.render('sign-up', { breeds: breeds });
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/sign-up', (req, res, next) => {
  const { name, email, dogName, dogBreed, password } = req.body;
  const user = {name, email, dogs: []};
  User.find({ email })
    .then((users) => {
      if (users && users.length ) {
        return Promise.reject(new Error("There's already an user with this email"));
      }
      return;
    })
    .then(() => {
      return Dog.create({name: dogName, breed: dogBreed });
    })
    .then((dog) => {
      user.dogs.push(dog._id);
    })
    .then(() => {
      return bcryptjs.hash(password, 10);
    })

    .then((hash) => {
      return User.create({
        ...user,
        passwordHash: hash
      });
    })
    .then((document) => {
      req.session.user = document._id;
      res.redirect('/private');
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/sign-in', (req, res, next) => {
  res.render('sign-in');
});

router.post('/sign-in', (req, res, next) => {
  let user;
  const { email, password } = req.body;
  User.findOne({ email })
    .then((document) => {
      if (!document) {
        return Promise.reject(new Error("There's no user with that email."));
      } else {
        user = document;
        return bcryptjs.compare(password, user.passwordHash);
      }
    })
    .then((result) => {
      if (result) {
        req.session.user = user._id;
        res.redirect('/private');
      } else {
        return Promise.reject(new Error('Wrong password.'));
      }
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/sign-out', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
