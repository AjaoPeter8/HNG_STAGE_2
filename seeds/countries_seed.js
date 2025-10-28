import db from '../db.js';

const countries = [
  {
    name: "Nigeria",
    capital: "Abuja",
    region: "Africa",
    population: 223000000,
    currency_code: "NGN",
    exchange_rate: 1500,
    flag_url: "https://flagcdn.com/ng.svg"
  },
  {
    name: "United States",
    capital: "Washington, D.C.",
    region: "Americas",
    population: 331000000,
    currency_code: "USD",
    exchange_rate: 1,
    flag_url: "https://flagcdn.com/us.svg"
  },
  {
    name: "Germany",
    capital: "Berlin",
    region: "Europe",
    population: 83000000,
    currency_code: "EUR",
    exchange_rate: 0.95,
    flag_url: "https://flagcdn.com/de.svg"
  }
];

export async function seed() {
  for (const c of countries) {
    const estimated_gdp =
      (c.population * (1000 + Math.random() * 1000)) / c.exchange_rate;
    await db('countries').insert({ ...c, estimated_gdp });
  }
}
