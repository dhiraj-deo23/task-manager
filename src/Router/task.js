const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Task = require("../Model/task");

router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send();
  }
});

router.get("/tasks", auth, async (req, res) => {
  try {
    const match = {};
    if (req.query.completed) {
      match.completed = req.query.completed === "true";
    }
    const sort = {};
    if (req.query.sortBy) {
      const sortArg = req.query.sortBy.split("_");
      sort[sortArg[0]] = sortArg[1] === "desc" ? -1 : 1;
    }
    //   const tasks = await Task.find({ owner: req.user._id });
    //   res.send(tasks)

    // GET /tasks?completed=true
    // GET /tasks?limit=2&skip=2
    // GET /tasks?sortBy=createdAt_asc

    await req.user.populate({
      path: "tasks",
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort,
      },
    });
    res.send(req.user.tasks);
  } catch (error) {
    res.status(500).send();
  }
});

router.delete("/tasks/all", auth, async (req, res) => {
  try {
    const tasks = await Task.deleteMany({ owner: req.user._id });
    res.send(tasks);
  } catch (error) {
    res.status(500).send();
  }
});

router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (err) {
    res.status(500).send();
  }
});

router.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdate = ["description", "completed"];
  const isValidOperation = updates.every((update) =>
    allowedUpdate.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send();
  }
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(400).send();
    }
    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();
    res.send(task);
  } catch (error) {
    res.status(500).send();
  }
});

router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const deletedTask = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!deletedTask) {
      return res.status(404).send();
    }
    res.send("Deleted");
  } catch (err) {
    res.status(500).send();
  }
});

module.exports = router;
