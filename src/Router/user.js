const express = require("express");
const router = express.Router();
const User = require("../Model/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const { welcomeMail, goodbyeMail } = require("../account");

router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    welcomeMail(user.name, user.email);
    res.status(201).send(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (err) {
    res.status(400).send();
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send();
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send();
  }
});

router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Invalid file format"));
    }
    cb(undefined, true);
  },
});
router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (err, req, res, next) => res.status(403).send({ error: err.message })
);

router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = null;
  await req.user.save();
  res.send();
});

router.get("/users/:id/avatar", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.set("content-type", "image/png");
  res.send(user.avatar);
});

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdate = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) =>
    allowedUpdate.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send();
  }
  try {
    // const user = await User.findById(req.user._id);
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
  } catch (err) {
    res.status(500).send();
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    // const deletedUser = await User.findByIdAndDelete(req.user._id);
    await req.user.remove();
    goodbyeMail(req.user.name, req.user.email);
    //deleting tasks assoc with user
    //   await Task.deleteMany({owner: req.user._id})
    res.send(req.user);
  } catch (err) {
    res.status(500).send();
  }
});

module.exports = router;
