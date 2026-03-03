/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const up = function(knex) {
  return knex.schema.createTable('users_password', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().unique().references('id').inTable('users').onDelete('CASCADE');
    table.string('reset_token').nullable();
    table.timestamp('reset_token_expiry').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function(knex) {
  return knex.schema.dropTable('users_password');
};