'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sessions', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      // SHA-256 of the current refresh token; the token itself is never stored.
      refreshTokenHash: { type: Sequelize.STRING, allowNull: false },
      userAgent: { type: Sequelize.STRING, allowNull: true },
      ip: { type: Sequelize.STRING, allowNull: true },
      expiresAt: { type: Sequelize.DATE, allowNull: false },
      lastUsedAt: { type: Sequelize.DATE, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('sessions', ['userId']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sessions');
  },
};
