'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('node-uuid');
const Schedule = require('../models/schedule');
const Candidate = require('../models/candidate');
const User = require('../models/user');
const Availability = require('../models/availability');

// フォームをレンダリング
router.get('/new', authenticationEnsurer, (req, res, next) => {
  res.render('new', { user: req.user });
});

// スケジュールの入力フォームを受け取る
router.post('/', authenticationEnsurer, (req, res, next) => {
  const scheduleId = uuid.v4();
  const updatedAt = new Date();
  Schedule.create({
    scheduleId: scheduleId,
    scheduleName: req.body.scheduleName.slice(0, 255),
    memo: req.body.memo,
    createdBy: req.user.id,
    updatedAt: updatedAt
  }).then((schedule) => {
    // 候補日を扱えるに整形して配列に格納する
    const candidateNames = req.body.candidates.trim().split('\n').map((s) => s.trim());
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

// スケジュールを取得して、その候補を取得する
router.get('/:scheduleId', authenticationEnsurer, (req, res, next) => {
  Schedule.findOne({
    include: [{
      model: User,
      attributes: ['userId', 'username']
    }],
    where: {
      // req.params.id : /:hoge -> req.params.hoge
      scheduleId: req.params.scheduleId
    },
    order: '"updatedAt" DESC'
  }).then((schedule) => {
    if (schedule) {
      Candidate.findAll({
        where: { scheduleId: schedule.scheduleId },
        order: '"candidateId" ASC'
      }).then((candidates) => {
        // res.render('schedule', {
        //   user: req.user,
        //   schedule: schedule,
        //   candidates: candidates,
        //   users: [req.user]
        // });
        // データベースからその予定すべての出欠を所得する
        Availability.findAll({
          include: [{
            model: User,
            sttributes: ['userId', 'username']
          }],
          where: { scheduleId: schedule.scheduleId },
          order: '"user.username" ASC, "candidateId" ASC'
        }).then((availabilities) => {
          // 出欠 MapMap(キー:ユーザー名,値:出欠Map(キー:候補 ID, 値:出欠)) を作成する
          const availabilityMapMap = new Map(); // key: userId, value: Map(key: candidateId, availability)
          availabilities.forEach((a) => {
            const map = availabilityMapMap.get(a.user.userId) || new Map();
            map.set(a.candidateId, a.availability);
            availabilityMapMap.set(a.user.userId, map);
          });

          // 閲覧ユーザーと出欠に紐ずくユーザーからユーザー Map (key: userId, value: user) を作る
          const userMap = new Map(); // key: userId, value: User
          userMap.set(parseInt(req.user.id), {
            isSelf: true,
            userId: parseInt(req.user.id),
            username: req.user.username
          });
          availabilities.forEach((a) => {
            userMap.set(a.user.userId, {
              isSelf: parseInt(req.user.id) === a.user.userId, //  閲覧ユーザーが自分自身かを含める
              userId: a.user.userId,
              username: a.user.username
            });
          });

          // 全ユーザー、全候補で二重ループしてそれぞれの出欠の値がない場合には、「出欠」を設定する
          const users = Array.from(userMap).map((keyValue) => keyValue[1]);
          users.forEach((u) => {
            candidates.forEach((c) => {
              const map = availabilityMapMap.get(u.userId) || new Map();
              const a = map.get(c.candidateId) || 0; // デフォルト値は 0 を利用
              map.set(c.candidateId, a);
              availabilityMapMap.set(u.userId, map);
            });
          });

          console.log(availabilityMapMap); // TODO 除去

          res.render('schedule', {
            user: req.user,
            schedule: schedule,
            candidates: candidates,
            users: users,
            availabilityMapMap: availabilityMapMap
          });
        });
      });
    } else {
      const err = new Error("指定された予定は見つかりません");
      err.status = 404;
      next(err);
    }
  });
});

module.exports = router;