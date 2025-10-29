import express from "express";
import bodyParser from "body-parser";
import db from "./db.js";
import axios from "axios";
import { createCanvas } from "canvas";
import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';
import knex from "knex";
import config from "./knexfile.js";
// import * as res from 'express/lib/response';

const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



app.post("/countries/refresh", async (req, res) => {
   try {
      const response = {};

      const country_data = await axios.get("https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies");
      const exchange_rates = await axios.get("https://open.er-api.com/v6/latest/USD");
      const countries = country_data.data;
      for (const country of countries) {
         const currency_code = country?.currencies?.map(currency => currency.code)[0] ?? null;
         const exchange_rate = currency_code ? exchange_rates.data.rates[currency_code] : null;
         const estimated_gdp = exchange_rate ? (country.population * (1000 + Math.random() * 1000)) / exchange_rate : 0;
         const data = { name: country.name.trim(), capital: country.capital, region: country.region, population: country.population, currency_code: currency_code, exchange_rate: exchange_rate, estimated_gdp: estimated_gdp, flag_url: country.flag, last_refreshed_at: new Date() };
         // Check if country exists
         const existing = await db("countries").where("name", data.name).first();

         if (existing) {
            // Update existing record
            await db("countries").where("name", data.name).update(data);
         } else {
            // Insert new record
            await db("countries").insert(data);
         }

         response[country.name] = data;
      }


      const totalCountries = (await db("countries").count("name as total"))[0].total;
      const lastRefreshed = new Date();
      const topCountries = await db("countries")
         .select("name", "estimated_gdp")
         .orderBy("estimated_gdp", "desc")
         .limit(5);

      // 🖼 Generate image summary
      const width = 800;
      const height = 400;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Background
      ctx.fillStyle = "#f0f8ff";
      ctx.fillRect(0, 0, width, height);

      // Title
      ctx.fillStyle = "#000";
      ctx.font = "bold 28px Arial";
      ctx.fillText("🌍 Countries Summary", 250, 50);

      // Total countries
      ctx.font = "22px Arial";
      ctx.fillText(`Total Countries: ${totalCountries}`, 80, 120);

      // Top 5 GDP countries
      ctx.fillText("Top 5 by Estimated GDP:", 80, 170);
      ctx.font = "20px Arial";
      topCountries.forEach((c, i) => {
         const gdp =
            typeof c.estimated_gdp === "number"
               ? c.estimated_gdp.toFixed(2)
               : Number(c.estimated_gdp || 0).toFixed(2);
         ctx.fillText(`${i + 1}. ${c.name} — ${gdp}`, 100, 210 + i * 30);
      });


      // Timestamp
      ctx.font = "18px Arial";
      ctx.fillText(`Last Refreshed: ${lastRefreshed.toLocaleString()}`, 80, 360);

      // Ensure cache directory exists
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) {
         fs.mkdirSync(cacheDir);
      }
      const outputPath = path.join(__dirname, "cache", "summary.png");
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(outputPath, buffer);

      res.status(200).json(response);
   }
   catch (error) {
      res.status(503).json({ "error": "External data source unavailable", "details": "Could not fetch data from [API name]" });
      console.log(error);
   }



});

app.get("/countries/image", (req, res) => {
   try {
      const imagePath = path.join(__dirname, "cache/summary.png");
      console.log(imagePath);
      // Check if file exists
      if (!fs.existsSync(imagePath)) {
         return res.status(404).json({ "error": "Summary image not found" });
      }

      // Set correct content type for PNG image
      res.setHeader('Content-Type', 'image/png');
      res.status(200).json(imagePath);
   }
   catch (error) {
      res.status(500).json({ "error": "Summary image not found" });
      console.log(error);
   }
})

app.get("/countries", async (req, res) => {
   try {
      const { sort, ...filters } = req.query;
      let query = db("countries");

      console.log(filters);
      for (const [key, value] of Object.entries(filters)) {
         const columnName = key === 'currency' ? 'currency_code' : key;
         query = query.where(columnName, value);
      }

      // Apply sorting
      if (sort) {
         if (sort === 'gdp_desc') {
            query = query.orderBy('estimated_gdp', 'desc');
         } else if (sort === 'gdp_asc') {
            query = query.orderBy('estimated_gdp', 'asc');
         } else if (sort === 'name_asc') {
            query = query.orderBy('name', 'asc');
         } else if (sort === 'name_desc') {
            query = query.orderBy('name', 'desc');
         }
      }

      const countries = await query.select("*");
      if (countries.length === 0) {
         return res.status(404).json({ "error": "Country not found" });
      }
      res.status(200).json(countries);
   }
   catch (error) {
      res.status(500).json({ "error": "Country not found" });
      console.log(error);
   }
});

app.get("/countries/:name", async (req, res) => {
   try {
      const name = req.params.name;
      const country = await db("countries").where("name", name).select("*");
      if (country.length === 0) {
         return res.status(404).json({ "error": "Country not found" });
      }
      res.status(200).json(country[0]);
   }
   catch (error) {
      res.status(404).json({ "error": "data" });
      console.log(error);
   }
});

app.delete("/countries/:name", async (req, res) => {
   try {
      const name = req.params.name;
      const country = await db("countries").where("name", name).select("*");
      if (country.length === 0) {
         return res.status(404).json({ "error": "Country not found" });
      }
      await db("countries").where("name", name).del();
      res.status(200).json("Deleted successfully.");
   }
   catch (error) {
      res.status(500).json({ "error": "Failed to delete" });
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
      res.status(500).json({ "error": "Internal server error" });
      console.log(error);
   }

})








app.listen(port, () => {
   console.log(`Running on http://localhost:${port}`);
});