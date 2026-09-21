'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Nullable: questions created before grading existed have no correct answer and are not scored.
    await queryInterface.addColumn('questions', 'correctAnswer', {
      type: Sequelize.JSONB,
      allowNull: true,
    });

    await queryInterface.createTable('attempts', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      quizId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'quizzes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      score: { type: Sequelize.INTEGER, allowNull: false },
      total: { type: Sequelize.INTEGER, allowNull: false },
      answers: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('attempts', ['userId']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('attempts');
    await queryInterface.removeColumn('questions', 'correctAnswer');
  },
};
