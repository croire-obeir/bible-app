/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Remove the existing table
  await knex.schema.dropTableIfExists('daily_verses');

  // Create the table again
  await knex.schema.createTable('daily_verses', (table) => {
    table.increments('id').unsigned().primary();

    table.date('verse_date').notNullable().unique();

    table.string('book_code', 10).notNullable();

    table.smallint('chapter').unsigned().notNullable();

    table.smallint('verse_start').unsigned().notNullable();

    table.smallint('verse_end').unsigned().notNullable();

    table.timestamps(true, true);
  });
}


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('daily_verses');
}
