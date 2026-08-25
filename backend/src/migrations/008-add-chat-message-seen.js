module.exports = {
  up: async ({ context: queryInterface, Sequelize }) => {
    await queryInterface.addColumn('chat_messages', 'seen', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('chat_messages', 'seen');
  }
};