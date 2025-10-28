export async function insertCountry(country) {
  try {
    // Compute estimated GDP
    const estimated_gdp =
      (country.population * (1000 + Math.random() * 1000)) / country.exchange_rate;

    // Insert into database
    const [id] = await db('countries').insert({
      ...country,
      estimated_gdp
    });

    console.log(`Country inserted with ID: ${id}`);
  } catch (err) {
    console.error('Error inserting country:', err);
  } finally {
    await db.destroy(); // Close DB connection
  }
}

export function estimatedGdp (population, exchange_rate) {

    
  return (population * (1000 + Math.random() * 1000)) / exchange_rate;
}