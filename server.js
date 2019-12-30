const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({
  path: "./config.env"
});

const app = require("./app");
const port = process.env.PORT || 3000;

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => console.log("Connection succesfull"))
  .catch(err => {
    console.log(err.message);
  });

const server = app.listen(port, () => {
  console.log("Server is launching");
});

console.log(app.get('env'));
// console.log(process.env);
// To ha