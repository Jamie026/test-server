'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'refresh_token', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('users', 'refresh_token');
  }
};