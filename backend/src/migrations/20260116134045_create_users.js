/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary(); // Auto-incrementing ID
    table.string('username').unique().notNullable();
    table.string('email').unique().notNullable();
    table.string('password').notNullable(); // For hashed passwords
    table.timestamps(true, true); // Adds created_at and updated_at
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function(knex) {
  return knex.schema.dropTable('users');
};
