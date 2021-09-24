const express = require("express");
require("./src/db/mongoose");
const userRoute = require("./src/Router/user");
const taskRoute = require("./src/Router/task");

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(userRoute);
app.use(taskRoute);

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
