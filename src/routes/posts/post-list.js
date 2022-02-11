const { Router } = require("express");
const router = Router();
const { Post } = require("../../db.js");

router.get("/", async (req, res) => {
  const { category, author } = req.query;
  try {
    let allPosts = [];
    if (category) {
      allPosts = await Post.findAll({
        where: { category: category },
      });
    } else if (author) {
      allPosts = await Post.findAll({
        where: { author: author },
      });
    } else {
      allPosts = await Post.findAll();
    }
    return res.status(200).send({
      allPosts,
    });
  } catch (err) {
    console.log(err);
    res.status(404).send(err);
  }
});

module.exports = router;
