const router = require("express").Router();
const Poll = require("../models/Poll");
const Vote = require("../models/Vote");
const auth = require("../middleware/authMiddleware");
const jwt = require("jsonwebtoken");

// CREATE POLL
router.post("/", auth, async (req, res) => {
  const { question, options } = req.body;

  if (!question || !options || options.length < 2) {
    return res.status(400).json({ msg: "Invalid poll data" });
  }

  try {
    const poll = await Poll.create({
      question,
      options: options.map((o) => ({
        text: o,
        votes: 0,
      })),
      createdBy: req.user,
    });

    res.json(poll);
  } catch (err) {
    res.status(500).json({ msg: "Error creating poll" });
  }
});

router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const total = await Poll.countDocuments(query);
    const search = req.query.search || "";
    const filter = req.query.filter || "latest";

    let query = {};

    if (search) {
      query.question = { $regex: search, $options: "i" };
    }

    let sortOption = { createdAt: -1 };

    if (filter === "oldest") sortOption = { createdAt: 1 };
    if (filter === "mostVotes") sortOption = { "options.votes": -1 };

    const polls = await Poll.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    let userId = null;

    // extract user if token exists
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch {}
    }

    // attach userVote to each poll
    let votes = [];
    if (userId) {
      votes = await Vote.find({ user: userId }).lean();
    }

    const pollsWithVotes = polls.map((poll) => {
      const vote = votes.find((v) => v.poll.toString() === poll._id.toString());

      return {
        ...poll,
        userVote: vote ? vote.optionIndex : null,
      };
    });

    res.json({
      polls: pollsWithVotes,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      total,
    });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching polls" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    res.json(poll);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching poll" });
  }
});

// VOTE
router.post("/vote", auth, async (req, res) => {
  const { pollId, optionIndex } = req.body;

  try {
    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ msg: "Poll not found" });

    const existingVote = await Vote.findOne({
      user: req.user,
      poll: pollId,
    });

    if (existingVote) {
      const prevIndex = existingVote.optionIndex;

      poll.options[prevIndex].votes -= 1;
      poll.options[optionIndex].votes += 1;

      existingVote.optionIndex = optionIndex;
      await existingVote.save();
    } else {
      await Vote.create({
        user: req.user,
        poll: pollId,
        optionIndex,
      });

      poll.options[optionIndex].votes += 1;
    }

    await poll.save();

    res.json({ msg: "Vote updated" });
  } catch (err) {
    res.status(500).json({ msg: "Error voting" });
  }
});

// UPDATE POLL
router.put("/:id", auth, async (req, res) => {
  const { question, options } = req.body;

  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) return res.status(404).json({ msg: "Poll not found" });

    if (poll.createdBy.toString() !== req.user) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    if (question) poll.question = question;

    if (options && options.length >= 2) {
      poll.options = options.map((o) => ({
        text: o,
        votes: 0,
      }));

      await Vote.deleteMany({ poll: req.params.id });
    }

    await poll.save();

    res.json(poll);
  } catch (err) {
    res.status(500).json({ msg: "Error updating poll" });
  }
});

// DELETE POLL
router.delete("/:id", auth, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) return res.status(404).json({ msg: "Poll not found" });

    if (poll.createdBy.toString() !== req.user) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    await poll.deleteOne();
    await Vote.deleteMany({ poll: req.params.id });

    res.json({ msg: "Poll deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting poll" });
  }
});

module.exports = router;
