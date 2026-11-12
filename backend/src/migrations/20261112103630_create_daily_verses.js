/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const up = function(knex) {
  return knex.schema.createTable('daily_verses', (table) => {
    table.increments('id').primary();
    table.date('verse_date').notNullable().unique();
    table.string('book_code', 10).notNullable();
    table.smallint('chapter').unsigned().notNullable();
    table.smallint('verse').unsigned().notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const down = function(knex) {
  return knex.schema.dropTableIfExists('daily_verses');
};
