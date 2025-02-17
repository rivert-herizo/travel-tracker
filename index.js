import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: 'postgres',
  host: 'localhost',
  database: 'world',
  password: '123Abc567..',
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


async function checkVisisted() {
  const result = await db.query("SELECT country_code FROM visited_countries");

  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}


app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  res.render('index.ejs', {countries: countries, total: countries.length}); 
});

app.post("/add", async (req, res) => {
  // try {
  //   const db_result = await db.query("SELECT * FROM countries");
  //   const country_put = capitalizeWords(req.body.country);
  //   console.log(country_put)
  //   const search = db_result.rows.find((country) => country.country_name === country_put);
    
  //   const countries = await checkVisisted(); // Fetch visited countries again

  //   if (search && countries.includes(search.country_code)) {
  //     res.render("index.ejs", { countries: countries, total: countries.length, error: `You've already been there baby, go somewhere else` });
  //   } else if (search) {
  //     await db.query(`INSERT INTO visited_countries (country_code) VALUES ($1)`, [search.country_code]);
  //     res.redirect("/");
  //   } else {
  //     res.render("index.ejs", { countries: countries, total: countries.length, error: `Country doesn't exist` });
  //   }
  // } catch (error) {
  //   console.error(error);
  //   res.render("index.ejs", { countries: [], total: 0, error: "An unexpected error occurred." });
  // }

  try {
    const country_put = capitalizeWords(req.body.country);
    console.log(country_put);
  
    // Perform the query directly in the database, using LIKE with $1
    const db_result = await db.query(
      "SELECT * FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [country_put.toLowerCase()] // Use the country name to match the query
    );
  
    const search = db_result.rows[0]; // If a match is found, this should contain the first result
    
    const countries = await checkVisisted(); // Fetch visited countries again
  
    if (search && countries.includes(search.country_code)) {
      res.render("index.ejs", { countries: countries, total: countries.length, error: `You've already been there baby, go somewhere else` });
    } else if (search) {
      await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [search.country_code]);
      res.redirect("/");
    } else {
      res.render("index.ejs", { countries: countries, total: countries.length, error: `Country doesn't exist` });
    }
  } catch (error) {
    console.error(error);
    res.render("index.ejs", { countries: [], total: 0, error: "An unexpected error occurred." });
  }
  
});

function capitalizeWords(str) {
  return str
    .split(' ')  // Split the string into an array of words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())  // Capitalize each word
    .join(' ');  // Join the words back together
}

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
