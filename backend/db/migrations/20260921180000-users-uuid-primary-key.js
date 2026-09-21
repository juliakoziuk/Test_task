'use strict';

/**
 * Switches users.id (and the userId foreign keys in quizzes/attempts) from an
 * auto-increment integer to a UUID, keeping existing rows linked.
 * Uses gen_random_uuid(), built into PostgreSQL 13+.
 */
module.exports = {
  async up(queryInterface) {
    const sql = (query, transaction) => queryInterface.sequelize.query(query, { transaction });

    await queryInterface.sequelize.transaction(async (t) => {
      await sql('ALTER TABLE users ADD COLUMN uuid UUID NOT NULL DEFAULT gen_random_uuid()', t);

      for (const table of ['quizzes', 'attempts']) {
        await sql(`ALTER TABLE ${table} ADD COLUMN "userUuid" UUID`, t);
        await sql(
          `UPDATE ${table} SET "userUuid" = users.uuid FROM users WHERE users.id = ${table}."userId"`,
          t,
        );
        // Also drops the old foreign key and (for attempts) the index on the column.
        await sql(`ALTER TABLE ${table} DROP COLUMN "userId"`, t);
      }

      await sql('ALTER TABLE users DROP CONSTRAINT users_pkey', t);
      await sql('ALTER TABLE users DROP COLUMN id', t);
      await sql('ALTER TABLE users RENAME COLUMN uuid TO id', t);
      await sql('ALTER TABLE users ADD PRIMARY KEY (id)', t);

      for (const table of ['quizzes', 'attempts']) {
        await sql(`ALTER TABLE ${table} RENAME COLUMN "userUuid" TO "userId"`, t);
        await sql(`ALTER TABLE ${table} ALTER COLUMN "userId" SET NOT NULL`, t);
        await sql(
          `ALTER TABLE ${table} ADD CONSTRAINT "${table}_userId_fkey"
           FOREIGN KEY ("userId") REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE`,
          t,
        );
      }
      await sql('CREATE INDEX attempts_user_id ON attempts ("userId")', t);
    });
  },

  async down() {
    throw new Error('Converting users.id back from UUID to integer is not supported');
  },
};
