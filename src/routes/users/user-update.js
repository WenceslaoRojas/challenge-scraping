const { Router } = require("express");
const router = Router();
const bcrypt = require("bcryptjs");
const { User } = require("../../db.js");

router.put("/", async (req, res) => {
  try {
    const { username, email, newUsername, newEmail, newPassword } = req.body;

    const foundUser = await User.findOne({
      where: {
        user: username,
      },
    });
    const foundEmail = await User.findOne({
      where: { email: email },
    });

    if (!foundUser || !foundEmail) {
      throw "Incorrect credentials, please try again.";
    }

    if (newUsername) {
      if (!/^[a-zA-Z0-9]+$/.test(username)) {
        return res.send("user must only have numbers and letters");
      } else await foundUser.update({ user: newUsername });
    }
    if (newEmail) {
      if (!/\S+@\S+\.\S+/.test(email)) {
        return res.send("Invalid email");
      } else await foundUser.update({ email: newEmail });
    }
    if (newPassword) {
      if (
        !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(
          newPassword
        )
      ) {
        return res.send(
          "Password must have at least 8 chars 1 Uppercase, 1 lowercase,1 number and 1 special character"
        );
      } else {
        let salt = bcrypt.genSaltSync(10);
        let pass = bcrypt.hashSync(newPassword, salt);
        await foundUser.update({ password: pass });
      }
    }

    return res.status(201).send({
      msg: "Credentials updated successfully.",
    });
  } catch (err) {
    console.error(err);
    res.status(404).send(err);
  }
});

module.exports = router;
