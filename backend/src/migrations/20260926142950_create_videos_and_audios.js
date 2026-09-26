/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */


export async function up(knex) {
  await knex.schema.createTable('videos', (table) => {
    table.increments('id').primary();
    table.string('youtube_video_id', 20).notNullable().unique();
    table.text('title').notNullable();
    table.string('classification', 255).notNullable();
    table.text('thumbnail').nullable();
    table.timestamp('published_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('audios', (table) => {
    table.increments('id').primary();
    table.string('youtube_video_id', 20).notNullable().unique();
    table.text('title').notNullable();
    table.string('classification', 255).notNullable();
    table.text('thumbnail').nullable();
    table.timestamp('published_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('audios');
  await knex.schema.dropTableIfExists('videos');
}
