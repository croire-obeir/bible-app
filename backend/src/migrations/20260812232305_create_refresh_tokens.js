/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const up = function(knex) {
  return knex.schema.createTable('refresh_tokens', (table) => {
        table.increments('id').primary();

        table
            .integer('user_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('users')
            .onDelete('CASCADE');

        table
            .string('token', 128)
            .notNullable()
            .unique();

        table
            .timestamp('expires_at')
            .notNullable();

        table
            .timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function(knex) {
  return knex.schema.dropTable('refresh_tokens');
};
