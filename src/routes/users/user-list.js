const { Router } = require("express");
const router = Router();
const { User } = require("../../db.js");

router.get("/", async (req, res) => {
  try {
    //Se buscan todos los usuarios de la DB y se devuelven excluyendo  su password
    let allUsers = await User.findAll({
      attributes: { exclude: ["password"] },
    });
    return res.status(200).send({
      allUsers: allUsers,
    });
  } catch (err) {
    console.log(err);
    res.status(404).send(err);
  }
});

module.exports = router;
