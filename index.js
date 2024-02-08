import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "World",
  password: "sHRIHARI@29",
  port: 5432,
});

const human = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "World",
  password: "sHRIHARI@29",
  port: 5432,
});

let maths = [
  { question: "", answer: "" }
];

db.connect();

db.query("SELECT * FROM gk", (err, res) => {
  if (err) {
    console.error("Error executing query", err.stack);
  } else {
    maths = res.rows;
  }
  db.end();
});

let totalCorrect = 0;
let currentQuestion = {};
let name;
let people = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/index", async (req, res) => {
  totalCorrect = 0;
  console.log(currentQuestion);
  await nextQuestion();
  res.render("index.ejs", { thisq: currentQuestion });
});

app.get("/", async (req, res) => {
  res.render("login.ejs");
});

human.connect();

app.post("/instruct", async (req, res) => {
  name = req.body;
  res.render("instruct.ejs", { response: name });
});

app.post("/submit", (req, res) => {
  let ans = req.body.answer.trim();
  let isCorrect = false;
  if (currentQuestion.answer == ans) {
    totalCorrect++;
    isCorrect = true;
    nextQuestion();
    res.render("index.ejs", {
      thisq: currentQuestion,
      wasCorrect: isCorrect,
      totalScore: totalCorrect,
    });
  } else {
    human.query("INSERT INTO people (personname, score) VALUES($1, $2)", [name, totalCorrect], (err, response) => {
      if (err) {
        console.log(err);
      } else {
        human.query("SELECT * FROM people ORDER BY score DESC LIMIT 5", (err, peopleResponse) => {
          if (err) {
            console.error("Error executing query", err.stack);
          } else {
            people = peopleResponse.rows;
            res.render("final.ejs", {
              totalScore: totalCorrect,
              response: name,
              people: people,
            });
          }
        });
      }
    });
  }
});

async function nextQuestion() {
  const randomquestion = maths[Math.floor(Math.random() * maths.length)];
  currentQuestion = randomquestion;
  console.log(currentQuestion);
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
