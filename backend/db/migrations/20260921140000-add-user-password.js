'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'passwordHash', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Users created before auth existed get an unusable hash: they cannot log in.
    await queryInterface.sequelize.query(
      `UPDATE users SET "passwordHash" = '!' WHERE "passwordHash" IS NULL`,
    );

    await queryInterface.changeColumn('users', 'passwordHash', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'passwordHash');
  },
};
