const { Router } = require("express");
const router = Router();

const userUpdate = require("./users/user-update");
const postList = require("./posts/post-list");
const userList = require("./users/user-list");
router.use("/user/update", userUpdate);
router.use("/post/list", postList);
router.use("/user/list", userList);

module.exports = router;
