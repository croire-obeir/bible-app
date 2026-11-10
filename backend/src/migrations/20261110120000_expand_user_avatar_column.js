export const up = async (knex) => {
  await knex.raw('ALTER TABLE users MODIFY COLUMN avatar LONGTEXT NULL');
};

export const down = async (knex) => {
  await knex.raw('ALTER TABLE users MODIFY COLUMN avatar VARCHAR(255) NULL');
};