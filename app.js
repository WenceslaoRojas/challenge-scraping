const express = require("express");
const cors = require("cors");
require("dotenv").config();
const server = express();
const routes = require("./src/routes/index-routes");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const createToken = require("jsonwebtoken");
const indexUserModel = require("./src/db.js");
const auth = express();
const { JWT } = process.env;
const scrap = require("./src/controller/scrap");
const userRegister = require("./src/routes/users/user-register");

server.use(express.urlencoded({ extended: true }));
server.set("keyWeb", JWT);
server.use(cors());
server.use(morgan("dev"));
server.use(express.json());

// Error catching endware.
server.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const message = err.message || err;
  console.error(err);
  res.status(status).send(message);
});

server.post("/user/register", userRegister);

server.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    let instanceUser = await indexUserModel.User.findOne({
      where: { user: username },
    });

    if (instanceUser === null) {
      res.send({ msg: "User not found" });
    } else {
      if (bcrypt.compareSync(password, instanceUser.password)) {
        const payload = {
          check: true,
        };
        const token = createToken.sign(payload, server.get("keyWeb"), {
          expiresIn: "1 days",
        });
        res.json({
          mensaje: "Successful authentication",
          token: token,
        });
      } else {
        res.json({ msg: "Incorrect password" });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(404).send({ error: err });
  }
});

auth.use(function (req, res, next) {
  const token = req.headers["access-token"];

  try {
    if (token) {
      createToken.verify(token, server.get("keyWeb"), (err, decoded) => {
        if (err) {
          return res.json({ mensaje: "Invalid Token" });
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      res.send({
        mensaje: "Token not obtained.",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(404).send({ error: err });
  }
});

//ruta para probar token jwt
// server.use("/", auth, routes);
//rutas

server.use("/", scrap, routes);

module.exports = server;
