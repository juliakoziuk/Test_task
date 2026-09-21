'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // Added as nullable first so existing quizzes can be assigned an owner.
    await queryInterface.addColumn('quizzes', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    const [[{ count }]] = await queryInterface.sequelize.query(
      'SELECT COUNT(*)::int AS count FROM quizzes',
    );
    if (count > 0) {
      await queryInterface.sequelize.query(
        `INSERT INTO users (name, email, "createdAt", "updatedAt")
         VALUES ('Legacy user', 'legacy@example.com', NOW(), NOW())`,
      );
      await queryInterface.sequelize.query(
        `UPDATE quizzes SET "userId" = (SELECT id FROM users WHERE email = 'legacy@example.com')`,
      );
    }

    await queryInterface.changeColumn('quizzes', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('quizzes', 'userId');
    await queryInterface.dropTable('users');
  },
};
