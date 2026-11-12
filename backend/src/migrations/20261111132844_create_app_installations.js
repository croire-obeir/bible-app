/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */


export async function up(knex) {
  await knex.schema.createTable('app_installations', (table) => {
    table.bigIncrements('id').unsigned().primary();
    table.uuid('installation_id').notNullable().unique();
    table.integer('user_id').unsigned().nullable();
    table.foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table.string('platform', 20).notNullable();
    table.string('app_version', 20).nullable();
    table.timestamp('first_seen_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('last_seen_at').notNullable().defaultTo(knex.fn.now());
    table.timestamps(true, true);
    table.index('user_id');
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('app_installations');
}

