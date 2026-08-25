module.exports = {
  up: async ({ context: queryInterface, Sequelize }) => {
    await queryInterface.addColumn('chat_messages', 'receiver_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('chat_messages', 'receiver_id');
  }
};