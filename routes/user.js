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
    .then(user => {
      userData = user;
      return Dog.populate(user.dogs, { path: 'breed' });
    })
    .then(dogs => {
      userData.dogs = dogs;
      res.render('user/profile', { user: userData });
    })
    .catch(error => {
      next(error);
    });
});

userRouter.post('/avatar-upload', uploader.single('photo'), (req, res, next) => {
  const photoUrl = req.file.url;

  User.findByIdAndUpdate(req.session.user, { photoUrl })
    .then(() => {
      res.redirect('profile');
    })
    .catch(error => {
      next(error);
    });
});

userRouter.get('/edit', (req, res, next) => {
  const id = req.session.user;
  let userData;

  User.findById(id)
    .then(document => {
      userData = document;
      console.log(userData);
      res.render('user/edit', { userData });
    })
    .catch(error => {
      next(error);
    });
});

userRouter.post('/edit', uploader.single('photo'), (req, res, next) => {
  const id = req.session.user;
  const user = {
    name: req.body.name,
    updatedDate: new Date()
  };

  if (req.file && req.file.url) {
    user.photoUrl = req.file.url;
  }

  User.findByIdAndUpdate(id, user)
    .then(() => {
      res.redirect('profile');
    })
    .catch(error => {
      next(error);
    });
});

userRouter.get('/:userId', (req, res, next) => {
  const userId = req.params.userId;
  let user;
  User.findById(userId)
    .populate('dogs')
    .then(doc => {
      //console.log('dog details', doc.dogs);
      user = doc.toObject();
      return Dog.populate(user.dogs, { path: 'breed' });
    })
    .then(dogs => {
      console.log('dog breed', dogs);
      res.render('user/public-profile', {user});
    })
    .catch(error => {
      next(error);
    });
});

module.exports = userRouter;
