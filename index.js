require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

const Person = require("./models/person");

morgan.token("json-body", (req) => JSON.stringify(req.body));

app.use(cors());
app.use(express.json());
app.use(express.static("dist"));
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :json-body"));

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/info", (request, response) => {
  response.send(`Phonebook has info for ${persons.length} people.<br/>${Date()}`);
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((result) => response.json(result));
});

app.post("/api/persons", (request, response) => {
  const { name, number, id = null } = request.body;

  if (!name || !number) {
    return response.status(400).json({
      error: "name or number missing",
    });
  }

  if (persons.find((person) => person.name.toLowerCase() === name.toLowerCase())) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }

  const person = {
    id: id ?? Math.floor(Math.random() * 100000) + 1,
    name,
    number,
  };
  persons = persons.concat(person);

  response.status(201).json(person);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);

  if (!person) {
    return response.status(404).end();
  }

  response.json(person);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);

  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
