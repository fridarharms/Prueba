const express = require("express");
const apiRouter = require("./api");
const cors = require("cors");

const app = express();

app.use(cors({
    origin: "http://localhost:3000"
}));

app.set("port", 3001);
app.use(express.text());
app.use(express.json());

// Usa la API en la ruta /api
app.use('/api', apiRouter);

app.get("/", (req, res) => {
  console.log("Servidor en funcionamiento");
  res.send("Hello World");
});

app.listen(app.get("port"), () => {
  console.log("Server running on port 3001");
});
