'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('node-uuid');
const Schedule = require('../models/schedule');
const Candidate = require('../models/candidate');

router.get('/new', authenticationEnsurer, (req, res, next) => {
  res.render('new', { user: req.user });
});

router.post('/', authenticationEnsurer, (req, res, next) => {
  console.log(req.body); // TODO 予定と候補を保存する実装をする
  res.redirect('/');
  const scheduleId = uuid.v4();
  const updatedAt = new Date();
  Schedule.create({
    scheduleId: scheduleId,
    scheduleName: req.body.scheduleName.slice(0, 255),
    memo: req.body.memo,
    createdBy: req.user.id,
    updatedAt: updatedAt
  }).then((schedule) => {
    // 扱えるに整形して配列に格納する
    const candidateNames = req.body.candidates.trim().split('\n').map((s) => s.trim());
    格納した配列をそれぞれ
    const candidates = candidateNames.map((c) => {
      return {
        candidateName: c,
        scheduleId: schedule.scheduleId
      };
    });
    Candidate.bulkCreate(candidates).then(() => {
      res.redirect('/schedules/' + schedule.scheduleId);
    });
  });
});

module.exports = router;