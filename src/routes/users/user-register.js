const { Router } = require("express");
const router = Router();
const bcrypt = require("bcryptjs");
const { User } = require("../../db.js");

router.post("/", async (req, res) => {
  const { username, password, email } = req.body;

  try {
    if (
      !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(
        password
      )
    ) {
      return res.send(
        "Password must have at least 8 chars 1 Uppercase, 1 lowercase,1 number and 1 special character"
      );
    }

    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      return res.send("user must only have numbers and letters");
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.send("Invalid email");
    }
    let salt = bcrypt.genSaltSync(10);
    let pass = bcrypt.hashSync(password, salt);

    let foundEmail = await User.findOne({ where: { email: email } });
    if (foundEmail)
      return res.send(
        `The email: ${email} already exists in the database,please try another one.`
      );
    let foundUsername = await User.findOne({ where: { user: username } });
    if (foundUsername)
      return res.send(
        `The username: ${username} already exists in the database,please try another one.`
      );

    await User.create({
      user: username,
      password: pass,
      email: email,
    });

    return res
      .status(201)
      .send({ msg: `The new user "${username}" created successfully` });
  } catch (err) {
    console.log(err);
    res.status(404).send(err);
  }
});

module.exports = router;
