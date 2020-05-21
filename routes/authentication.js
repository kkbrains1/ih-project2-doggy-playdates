'use strict';

const { Router } = require('express');

const bcryptjs = require('bcryptjs');
const User = require('./../models/user');
const Breed = require('./../models/breed');
const Dog = require('./../models/dog');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD
  }
});

const router = new Router();

router.get('/sign-up', (req, res, next) => {
  Breed.find()
    .then((breeds) => {
      res.render('sign-up', { breeds: breeds });
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/sign-up', (req, res, next) => {
  const { name, email, dogName, dogBreed, password } = req.body;
  const user = { name, email, dogs: [] };

  const generateToken = (length) => {
    const characters =
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let token = '';
    for (let i = 0; i < length; i++) {
      token += characters[Math.floor(Math.random() * characters.length)];
    }
    return token;
  };

  User.find({ email })
    .then((users) => {
      if (users && users.length) {
        return Promise.reject(
          new Error("There's already an user with this email")
        );
      }
      return;
    })
    .then(() => {
      return Dog.create({ name: dogName, breed: dogBreed });
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
        confirmationCode: generateToken(10),
        passwordHash: hash
      });
    })
    .then((document) => {
      console.log(document);
      req.session.user = document._id;
      transporter.sendMail({
        from: `Doggy Playdate<${process.env.NODEMAILER_EMAIL}`,
        to: email,
        subject: 'Confirm Account',
        html: `<a href="http://localhost:3000/authentication/confirm/${document.confirmationCode}">Verify Email</a>`
      });

      res.redirect('/event/list');
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/confirm/:confirmCode', (req, res, next) => {
  const confirmationCode = req.params.confirmCode;
  User.findOneAndUpdate({confirmationCode},{status: 'Active'}).then(user => {
    if (user) {
      res.render('confirmation');
    } else {
      res.render('error');
    }
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
        res.redirect('/event/list');
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
