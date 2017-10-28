'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const Availability = require('../models/availability');

router.post('/:scheduleId/users/:userId/candidates/:candidateId', authenticationEnsurer, (req, res, next) => {
  const scheduleId = req.params.scheduleId;
  const userId = req.params.userId;
  const candidateId = req.params.candidateId;
  let availability = req.body.availability;
  availability = availability ? parseInt(availability) : 0;
  console.log(`scheduleId : ${scheduleId} userId : ${userId} candidateId : ${candidateId} availability : ${availability}`);
  Availability.upsert({
    candidateId: candidateId,
    userId: userId,
    availability: availability,
    scheduleId: scheduleId
  }).then(() => {
    console.log('OK');
    res.json({ status: 'OK', availability: availability });
  });
});

module.exports = router;