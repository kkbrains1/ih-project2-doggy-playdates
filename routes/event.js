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
  const { userLatitude, userLongitude, distance } = req.query;
  const kmToDegrees = (value) => value / (40000 / 360);

  Event.find()
    .where('location')
    .within()
    .circle({ center: [userLongitude, userLatitude], radius: kmToDegrees(distance) })
    .then((events) => {
      res.render('event/list', { events });
    })
    .catch((error) => {
      next(error);
    });
});

eventRouter.get('/:eventId/edit', (req, res, next) => {
  const eventId = req.params.eventId;
  //const event;
  //let formattedStartDate;
  //let formattedEndDate;
  Event.findOne({
    _id: eventId,
    creator: req.user._id
  })
    .then((event) => {
      let formattedStartDate = event.date;
      formattedStartDate = formattedStartDate.toISOString().replace('Z', '');
      let formattedEndDate = event.endDate;
      formattedEndDate = formattedEndDate.toISOString().replace('Z', '');
      res.render('event/edit', { event, formattedStartDate, formattedEndDate });
    })
    .catch((error) => {
      next(error);
    });
});

eventRouter.post('/:eventId/edit', uploader.single('photo'), (req, res, next) => {
  const eventId = req.params.eventId;
  const { title, description, date, endDate, address, latitude, longitude } = req.body;
  let photo;
  let event;
  console.log(req.body);
  Event.findOne({
    _id: eventId,
    creator: req.user._id
  })
    .then((doc) => {
      event = doc.toObject();
      if (req.file) {
        photo = req.file.url;
      } else {
        photo = event.photo;
      }
      console.log(photo);
      return Event.findByIdAndUpdate(
        { _id: eventId },
        {
          title,
          description,
          date,
          endDate,
          address,
          photo,
          location: {
            type: 'Point',
            coordinates: [longitude, latitude]
          }
        }
      );
    })
    .then((result) => {
      console.log('result', result);
      res.redirect(`/event/${eventId}`);
    })
    .catch((error) => {
      next(error);
    });
});

eventRouter.post('/:eventId/delete', (req, res, next) => {
  const eventId = req.params.eventId;
  Event.findOneAndRemove({
    _id: eventId,
    creator: req.user._id
  })
    .then((result) => {
      console.log(result);
      res.redirect(`/event/list`);
    })
    .catch((error) => {
      next(error);
    });
});

eventRouter.get('/:eventId', (req, res, next) => {
  const eventId = req.params.eventId;
  let event;
  let startdate;
  Event.findById(eventId)
    .populate('event creator')
    .then((doc) => {
      event = doc.toObject();
      startdate = event.date;
      console.log('the event date is ', startdate);
      return (startdate = startdate.toString().substr(0, 21));
    })
    .then((startDate) => {
      console.log('the start date is', startDate);
      res.render('event/single', { event, startDate });
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = eventRouter;
