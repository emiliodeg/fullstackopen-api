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

let persons = [];

app.get("/info", (request, response) => {
  response.send(`Phonebook has info for ${persons.length} people.<br/>${Date()}`);
});

app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((result) => response.json(result))
    .catch(next);
});

app.post("/api/persons", (request, response, next) => {
  const { name, number } = request.body;

  if (!name || !number) {
    return response.status(400).json({
      error: "name or number missing",
    });
  }

  const person = new Person({
    name,
    number,
  });

  Person.findOne({ name })
    .then((personExists) => {
      if (personExists) {
        personExists
          .set({ number })
          .save()
          .then((result) => response.json(result))
          .catch(next);
        return;
      }

      person
        .save()
        .then((result) => response.json(result))
        .catch(next);
    })
    .catch(next);
});

app.put("/api/persons/:id", (request, response, next) => {
  const { number, name } = request.body;

  if (!name && !number) {
    return response.status(400).json({
      error: "name or number missing",
    });
  }

  const update = {};
  if (name) update.name = name;
  if (number) update.number = number;

  Person.findByIdAndUpdate(request.params.id, update, { new: true })
    .then((result) => response.json(result))
    .catch(next);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);

  if (!person) {
    return response.status(404).end();
  }

  response.json(person);
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => response.status(204).end())
    .catch(next);
});

app.use((error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
