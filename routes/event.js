'use strict';

const express = require('express');
const Event = require('./../models/event');

const eventRouter = new express.Router();

eventRouter.get('/create', (req, res, next) => {
  res.render('event/create');
});

eventRouter.post('/create', (req, res, next) => {
  //console.log(req.body);
  const title = req.body.title;
  const description = req.body.description;
  const date = req.body.date;
  const endDate = req.body.endDate;
  const latitude = req.body.latitude;
  const longitude = req.body.longitude;
  //const creator = req.user._id
  Event.create({
    title,
    description,
    date,
    endDate,
    location: {
      coordinates: [longitude, latitude]
    }
    //creator
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
    .then(events => {
      console.log(events)
      res.render('event/list', {events});
    })
    .catch(error => {
      next(error);
    });
});

eventRouter.get('/:eventId', (req, res, next) => {
  const eventId = req.params.eventId;
  Event.findById(eventId)
    .then(event => {
      console.log(event);
      res.render('event/single', {event});
    })
    .catch(error => {
      next(error);
    });
});

module.exports = eventRouter;
