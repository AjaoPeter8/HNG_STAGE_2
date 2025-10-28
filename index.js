import express from "express";
import bodyParser from "body-parser";
import db from "./db.js";
import axios from "axios";
import knex from "knex";
import config from "./knexfile.js";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const response = {};


app.post("/countries/refresh", async (req, res) => {
   try {
      const country_data = await axios.get("https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies");
      const exchange_rates = await axios.get("https://open.er-api.com/v6/latest/USD");
      const countries = country_data.data;
      for (const country of countries) {
         const currency_code = country?.currencies?.map(currency => currency.code)[0] ?? "null";
         const exchange_rate = currency_code ? exchange_rates.data.rates[currency_code] : "null";
         const estimated_gdp = exchange_rate ? (country.population * (1000 + Math.random() * 1000)) / exchange_rate : 0;
         const data = { name: country.name, capital: country.capital, region: country.region, population: country.population, currency_code: currency_code, exchange_rate: exchange_rate, estimated_gdp: estimated_gdp, flag_url: country.flag, last_refreshed_at: new Date().toISOString() };
         const [id] = await db("countries").insert(data).onConflict("name").merge();
         response[id] = data;
      }

      res.status(200).json(response);
   }
   catch (error) {
      res.status(503).json(`"error": "External data source unavailable", "details": "Could not fetch data from [API name]"`);
      console.log(error);
   }



});

app.get("/countries", async (req, res) => {
   try {
      const filters = req.query;
      let query = db("countries");

      console.log(filters);
      for (const [key, value] of Object.entries(filters)) {
         query = query.where(key, value);
      }
      const countries = await query.select("*");
      res.status(200).send(countries);
   }
   catch (error) {
      `Failed to fetch`;
      console.log(error);
   }
});

app.get("/countries/:name", async (req, res) => {
   try {
      const name = req.params.name;
      const country = await db("countries").where("name", name).select("*");
      res.status(200).send(country);
   }
   catch (error) {
      res.status(404).json(`"error": "Country not found"`)
      console.log(error);
   }
});

app.delete("/countries/:name", async (req, res) => {
   try {
      const name = req.params.name;
      const country = await db("countries").where("name", name).del();
      res.status(200).json(country);
   }
   catch (error) {
      `Failed to fetch`;
      console.log(error);
   }
});

app.get("/status", async (req, res) => {
   try {
      const response = await db("countries").count("name as total_countries").max("last_refreshed_at as last_refreshed_at");
      res.status(200).json({
         total_countries: response[0].total_countries,
         last_refreshed_at: response[0].last_refreshed_at
      })
      console.log(response)
   }
   catch (error) {
      res.status(500).json(`"error": "Internal server error" `);
      console.log(error);
   }

})






app.listen(port, () => {
   console.log(`Running on http://localhost:${port}`);
});