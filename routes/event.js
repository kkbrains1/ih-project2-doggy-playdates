'use strict';

const express = require('express');
const Event = require('./../models/event');
const Comment = require('./../models/comment');
const uploader = require('./../file-uploader');
const routeGuard = require('./../middleware/route-guard');

const eventRouter = new express.Router();

eventRouter.get('/create', routeGuard, (req, res, next) => {
  res.render('event/create');
});

eventRouter.post('/create', routeGuard, uploader.single('photo'), (req, res, next) => {
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
    .then(event => {
      const eventId = event._id;
      res.redirect(`/event/${eventId}`);
    })
    .catch(error => {
      next(error);
    });
});

eventRouter.get('/list', (req, res, next) => {
  Event.find()
    .populate('event creator')
    .then(events => {
      //console.log(events)
      res.render('event/list', { events });
    })
    .catch(error => {
      next(error);
    });
});

eventRouter.get('/search', routeGuard, (req, res, next) => {
  //console.log('searching', req.query);
  const { userLatitude, userLongitude, distance } = req.query;
  const kmToDegrees = value => value / (40000 / 360);

  Event.find()
    .where('location')
    .within()
    .circle({ center: [userLongitude, userLatitude], radius: kmToDegrees(distance) })
    .then(events => {
      res.render('event/list', { events });
    })
    .catch(error => {
      next(error);
    });
});

eventRouter.post('/:eventId/comment', (req, res, next) => {
  const eventId = req.params.eventId;
  Comment.create({
    description: req.body.description,
    event: eventId,
    creator: req.user._id
  })
    .then(comment => {
      //console.log('comment is saved ', comment);
      res.redirect(`/event/${eventId}`);
    })
    .catch(error => {
      next(error);
    });
});

eventRouter.post('/:eventId/join/', (req, res, next) => {
  const eventId = req.params.eventId;
  const userId = req.user._id;
  Event.findById({ _id: eventId })
    .then(event => {
      //console.log('user', userId, 'joining', event, event.participants);
      if (event.participants.includes(userId)) {
        return Promise.reject(new Error('You have already joined this event'));
      } else {
        return Event.findByIdAndUpdate({ _id: eventId }, { $push: { participants: userId } });
      }
    })
    .then(() => {
      //console.log('participants updated', result);
      res.redirect(`/event/${eventId}`);
    })
    .catch(error => {
      next(error);
    });
});

eventRouter.get('/:eventId/edit', routeGuard, (req, res, next) => {
  const eventId = req.params.eventId;
  Event.findOne({
    _id: eventId,
    creator: req.user._id
  })
    .then(event => {
      //console.log(event);
      let formattedStartDate = event.date;
      formattedStartDate = formattedStartDate.toISOString().replace('Z', '');
      let formattedEndDate = event.endDate;
      formattedEndDate = formattedEndDate.toISOString().replace('Z', '');
      res.render('event/edit', { event, formattedStartDate, formattedEndDate });
    })
    .catch(error => {
      next(error);
    });
});

eventRouter.post('/:eventId/edit', routeGuard, uploader.single('photo'), (req, res, next) => {
  const eventId = req.params.eventId;
  const { title, description, date, endDate, address, latitude, longitude } = req.body;
  let photo;
  let event;
  //console.log(req.body);
  Event.findOne({
    _id: eventId,
    creator: req.user._id
  })
    .then(doc => {
      event = doc.toObject();
      if (req.file) {
        photo = req.file.url;
      } else {
        photo = event.photo;
      }
      //console.log(photo);
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
    .then(result => {
      //console.log('result', result);
      res.redirect(`/event/${eventId}`);
    })
    .catch(error => {
      next(error);
    });
});

eventRouter.post('/:eventId/delete', routeGuard, (req, res, next) => {
  const eventId = req.params.eventId;
  Event.findOneAndRemove({
    _id: eventId,
    creator: req.user._id
  })
    .then(result => {
      //console.log(result);
      res.redirect(`/event/list`);
    })
    .catch(error => {
      next(error);
    });
});

eventRouter.get('/:eventId', routeGuard, (req, res, next) => {
  const eventId = req.params.eventId;
  let event;
  Event.findById(eventId)
    .populate('event creator')
    .populate('event participants')
    .then(doc => {
      event = doc.toObject();
      if (req.user && event.creator._id.toString() === req.user._id.toString()) {
        event.owner = true;
      }
      //console.log('true?', event.owner, 'req id', req.user._id, 'creator', event.creator._id);
      return Comment.find({ event: eventId }).populate('creator');
    })
    .then(comments => {
      //console.log(comments);
      res.render('event/single', { event, comments });
    })
    .catch(error => {
      next(error);
    });
});

module.exports = eventRouter;
