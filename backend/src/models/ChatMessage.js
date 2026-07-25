const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatMessage = sequelize.define('ChatMessage', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  match_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false }
}, {
  tableName: 'chat_messages',
  timestamps: true
});

module.exports = ChatMessage;