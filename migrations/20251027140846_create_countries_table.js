/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable("countries", (table) => {
    table.increments("id").primary(); // auto-generated ID
    table.string("name").notNullable(); // required
    table.string("capital").nullable(); // optional
    table.string("region").nullable(); // optional
    table.bigInteger("population").notNullable(); // required
    table.string("currency_code").notNullable(); // required
    table.decimal("exchange_rate", 10, 4).notNullable(); // required
    table.decimal("estimated_gdp", 18, 2).notNullable(); // computed later
    table.string("flag_url").nullable(); // optional
    table.timestamp("last_refreshed_at").defaultTo(knex.fn.now()); // auto timestamp
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTableIfExists("countries");
}
