import express from "express";
import bodyParser from "body-parser";
import crypto from 'crypto';
import axios from "axios";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const list = [];



app.post("/countries/refresh", async(req,res) => {
      try {
            const country_data = await axios.get("https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies");
            const countries = country_data.data;
            for (const country of countries) {
               list.push(`name: ${country.name}, capital: ${country.capital}, region: ${country.region}, population: ${country.population}, flag: ${country.flag}, currency: ${country?.currencies?.map(currency => currency.code)[0]??"null"}`);
             
               
            }
        }
        catch (error) {
           `Failed to fetch`;
            console.log(error);
        }

        console.log(list);
               res.status(200).send(list);
});






app.listen(port, () => {
  console.log(`Running on http://localhost:${port}`);
});