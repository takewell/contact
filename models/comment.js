'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Comment = loader.database.define('comments', {
  scheduleId: {
    type: Sequelize.UUID,
    allowNull: false
  },
  userId: {
    type: Sequelize.BIGINT,
    allowNull: false
  },
  comment: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
  freezeTableName: true,
  timestamps: false,
  indexes: [
    {
      fields: ['scheduleId']
    }
  ]
});

module.exports = Comment;