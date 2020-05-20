'use strict';

const express = require('express');
const Event = require('./../models/event');
const uploader = require('./../file-uploader');

const eventRouter = new express.Router();

eventRouter.get('/create', (req, res, next) => {
  res.render('event/create');
});

eventRouter.post('/create', uploader.single('photo'), (req, res, next) => {
  //console.log(req.body);
  const { title, description, date, endDate, address, latitude, longitude } = req.body;
  const creator = req.user._id;
  const photo = req.file.url;
  Event.create({
    title,
    description,
    date,
    endDate,
    address,
    photo,
    location: {
      coordinates: [longitude, latitude]
    },
    creator
  })
    .then((event) => {
      const eventId = event._id;
      res.redirect(`/event/${eventId}`);
    })
    .catch((error) => {
      next(error);
    });
});

eventRouter.get('/list', (req, res, next) => {
  Event.find()
    .populate('event creator')
    .then((events) => {
      //console.log(events)
      res.render('event/list', { events });
    })
    .catch((error) => {
      next(error);
    });
});

eventRouter.get('/search', (req, res, next) => {
  console.log('searching', req.query);
  const {userLatitude, userLongitude, distance} = req.query;
  const kmToDegrees = value => value / (40000 / 360);

  Event.find()
    .where('location')
    .within()
    .circle({center: [userLongitude, userLatitude],  radius: kmToDegrees(distance)})
    .then(events => {
      res.render('event/list', {events});
    })
    .catch(error => {
      next(error);
    });
});

eventRouter.get('/:eventId', (req, res, next) => {
  const eventId = req.params.eventId;
  Event.findById(eventId)
    .populate('event creator')
    .then((event) => {
      console.log(event);
      res.render('event/single', { event });
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = eventRouter;
