🌍 Global Insights API

## Overview
A robust Node.js Express API designed to aggregate, manage, and deliver comprehensive global country data. This service dynamically fetches information from external APIs, computes statistics like estimated GDP, and persists data using `Knex.js` with `MySQL`. It also provides a visual summary of key global insights.

## Features
-   **Data Aggregation**: Seamlessly fetches country details from `restcountries.com` and real-time exchange rates from `open.er-api.com`.
-   **Dynamic GDP Calculation**: Computes estimated Gross Domestic Product (GDP) for each country based on population and current exchange rates.
-   **Database Persistence**: Efficiently stores and manages country data in a `MySQL` database, ensuring data availability and consistency.
-   **Country Data Management**: Offers a full suite of API endpoints for retrieving all countries, filtering by criteria, fetching individual country details, and deleting records.
-   **API Status Monitoring**: Includes an endpoint to monitor the total number of countries in the database and the timestamp of the last data refresh.
-   **Visual Data Summary**: Generates a dynamic image summary showcasing total countries and top countries by estimated GDP, providing quick insights.

## Getting Started

To get this API up and running on your local machine, follow these steps.

### Installation
-   **1. Clone the Repository:**
    ```bash
    git clone https://github.com/AjaoPeter8/HNG_STAGE_2.git
    cd HNG_STAGE_2
    ```
-   **2. Install Dependencies:**
    ```bash
    npm install
    ```
-   **3. Database Setup:**
    *   Ensure you have a `MySQL` server running.
    *   Create a database named `countries` (or adjust the `knexfile.js` to match your preferred database name).
    *   Run database migrations to create the necessary `countries` table:
        ```bash
        npx knex migrate:latest
        ```
    *   *(Optional)* While the `countries_seed.js` file is commented out, if you had seed data, you would run:
        ```bash
        npx knex seed:run
        ```
-   **4. Start the Application:**
    ```bash
    node index.js
    ```
    The API will be accessible at `http://localhost:3000`.

### Environment Variables
For development, your `knexfile.js` contains hardcoded database credentials. For production environments, it is highly recommended to use environment variables.

| Variable | Example Value | Description |
| :------- | :------------ | :---------- |
| `DB_HOST` | `127.0.0.1`   | The database server host. |
| `DB_USER` | `root`        | The database user. |
| `DB_PASSWORD` | `''`          | The password for the database user. |
| `DB_NAME` | `countries`   | The name of the database. |

To use these as environment variables, you would typically create a `.env` file and modify `knexfile.js` to read from `process.env`.

## API Documentation

### Base URL
`http://localhost:3000`

### Endpoints

#### `POST /countries/refresh`
Refreshes the country data in the database by fetching the latest information from external APIs (`restcountries.com` and `open.er-api.com`). This operation calculates estimated GDP and updates existing country records or inserts new ones.

**Request**:
```json
{}
```
(No request payload needed)

**Response**:
```json
{
  "Nigeria": {
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 223000000,
    "currency_code": "NGN",
    "exchange_rate": 1500,
    "estimated_gdp": 123456789.00,
    "flag_url": "https://flagcdn.com/ng.svg",
    "last_refreshed_at": "2023-10-27T10:00:00.000Z"
  },
  "Germany": {
    "name": "Germany",
    "capital": "Berlin",
    "region": "Europe",
    "population": 83000000,
    "currency_code": "EUR",
    "exchange_rate": 0.95,
    "estimated_gdp": 9876543210.00,
    "flag_url": "https://flagcdn.com/de.svg",
    "last_refreshed_at": "2023-10-27T10:00:00.000Z"
  }
  // ... more country objects
}
```

**Errors**:
-   `503 Service Unavailable`: External data source unavailable.
    ```json
    {
      "error": "External data source unavailable",
      "details": "Could not fetch data from [API name]"
    }
    ```

#### `GET /countries`
Retrieves a list of all countries or filters them based on query parameters.

**Request**:
(No request payload needed. Filters are passed as query parameters.)
Example: `GET /countries?region=Africa`
Example: `GET /countries?name=Nigeria`

**Response**:
```json
[
  {
    "id": 1,
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 223000000,
    "currency_code": "NGN",
    "exchange_rate": 1500,
    "estimated_gdp": 123456789.00,
    "flag_url": "https://flagcdn.com/ng.svg",
    "last_refreshed_at": "2023-10-27T10:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Germany",
    "capital": "Berlin",
    "region": "Europe",
    "population": 83000000,
    "currency_code": "EUR",
    "exchange_rate": 0.95,
    "estimated_gdp": 9876543210.00,
    "flag_url": "https://flagcdn.com/de.svg",
    "last_refreshed_at": "2023-10-27T10:00:00.000Z"
  }
  // ... more country objects
]
```

**Errors**:
-   `404 Not Found`: No countries match the provided filters.

#### `GET /countries/:name`
Retrieves detailed information for a specific country by its name.

**Request**:
(No request payload needed. Country name is a path parameter.)
Example: `GET /countries/Nigeria`

**Response**:
```json
[
  {
    "id": 1,
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 223000000,
    "currency_code": "NGN",
    "exchange_rate": 1500,
    "estimated_gdp": 123456789.00,
    "flag_url": "https://flagcdn.com/ng.svg",
    "last_refreshed_at": "2023-10-27T10:00:00.000Z"
  }
]
```

**Errors**:
-   `404 Not Found`: Country not found.
    ```json
    {
      "error": "Country not found"
    }
    ```

#### `DELETE /countries/:name`
Deletes a country record from the database by its name.

**Request**:
(No request payload needed. Country name is a path parameter.)
Example: `DELETE /countries/Nigeria`

**Response**:
```json
1
```
(Returns the number of affected rows, typically `1` on success, `0` if not found.)

**Errors**:
-   `404 Not Found`: Country with the specified name does not exist.
-   `500 Internal Server Error`: An error occurred during the deletion process.

#### `GET /status`
Provides a status overview of the API, including the total number of countries and the timestamp of the last data refresh.

**Request**:
```json
{}
```
(No request payload needed)

**Response**:
```json
{
  "total_countries": 50,
  "last_refreshed_at": "2023-10-27T10:00:00.000Z"
}
```

**Errors**:
-   `500 Internal Server Error`: An internal server error occurred while fetching status.
    ```json
    {
      "error": "Internal server error"
    }
    ```

#### `GET /countries/image`
Retrieves a dynamically generated image summary showcasing total countries and top 5 countries by estimated GDP.

**Request**:
```json
{}
```
(No request payload needed)

**Response**:
(Returns a PNG image file)

**Errors**:
-   `500 Internal Server Error`: The summary image could not be found or generated.
    ```json
    {
      "error": "Summary image not found"
    }
    ```

## Usage

Once the server is running, you can interact with the API using tools like Postman, Insomnia, or `curl`.

**1. Refresh Country Data:**
To populate or update your database with the latest country information:

```bash
curl -X POST http://localhost:3000/countries/refresh
```

This will fetch data from external APIs, process it, and store it. You will receive a JSON response containing the updated country data.

**2. Retrieve All Countries:**
To get a list of all countries currently in the database:

```bash
curl http://localhost:3000/countries
```

**3. Filter Countries by Region:**
You can filter countries using query parameters, for example, to get all countries in 'Africa':

```bash
curl http://localhost:3000/countries?region=Africa
```

**4. Get Details for a Specific Country:**
To retrieve data for a single country by its name:

```bash
curl http://localhost:3000/countries/Nigeria
```

**5. Delete a Country:**
To remove a country record from the database:

```bash
curl -X DELETE http://localhost:3000/countries/Nigeria
```

The response will be `1` if successful, or `0` if the country was not found.

**6. Check API Status:**
To get current statistics like total countries and the last refresh time:

```bash
curl http://localhost:3000/status
```

**7. View Data Summary Image:**
To access the generated visual summary of the country data:

```bash
curl http://localhost:3000/countries/image --output summary.png
```
This command will download the `summary.png` image to your current directory.

## Technologies Used

| Technology  | Version   | Description                                           |
| :---------- | :-------- | :---------------------------------------------------- |
| Node.js     | ^16.x     | JavaScript runtime environment                        |
| Express.js  | ^5.1.0    | Fast, unopinionated, minimalist web framework         |
| Knex.js     | ^2.x      | SQL query builder for PostgreSQL, MySQL, SQLite3, Oracle |
| MySQL       | ^8.0      | Open-source relational database management system     |
| Axios       | ^1.12.2   | Promise-based HTTP client for the browser and node.js |
| Canvas      | ^3.2.0    | Drawing surfaces and images programmatically          |
| Body-parser | ^2.2.0    | Node.js body parsing middleware                       |

## Author Info

**AJAO PETER OLUWAFEMI**
-   [LinkedIn](https://linkedin.com/in/ajao-peter-oluwafemi)
-   [Twitter](https://twitter.com/Ajao_Peter_O)

---
[![Node.js](https://img.shields.io/badge/Node.js-v16%2B-green?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.1.0-blue?logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Knex.js](https://img.shields.io/badge/Knex.js-2.x-red?logo=knex.js&logoColor=white)](https://knexjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---
[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)