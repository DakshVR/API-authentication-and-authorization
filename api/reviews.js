const { Router } = require("express");
const { ValidationError } = require("sequelize");

const { Review, ReviewClientFields } = require("../models/review");
const { requireAuthentication } = require("../lib/auth");
const router = Router();

/*
 * Route to create a new review.
 */
router.post("/", requireAuthentication, async function (req, res, next) {
  const admin = req.admin;
  const userId = req.body.userId;

  if ((req.user && req.user == userId) || admin) {
    try {
      const review = await Review.create(req.body, ReviewClientFields);
      res.status(201).send({ id: review.id });
    } catch (e) {
      if (e instanceof ValidationError) {
        res.status(400).send({ error: e.message });
      } else {
        next(e);
      }
    }
  } else {
    res.status(403).send({
      error: "Unauthorized To Access the specified resource",
    });
  }
});

/*
 * Route to fetch info about a specific review.
 */
router.get("/:reviewId", async function (req, res, next) {
  const reviewId = req.params.reviewId;
  try {
    const review = await Review.findByPk(reviewId);
    if (review) {
      res.status(200).send(review);
    } else {
      next();
    }
  } catch (e) {
    next(e);
  }
});

/*
 * Route to update a review.
 */
router.put(
  "/:reviewId",
  requireAuthentication,
  async function (req, res, next) {
    const reviewId = req.params.reviewId;
    try {
      const review = await Review.findOne({ where: { id: reviewId } });
      if (!review) {
        return res
          .status(404)
          .send({ error: `Review with id ${reviewId} does not exist.` });
      }
      if (req.user !== review.userId && !req.admin) {
        return res.status(403).send({ error: "Unauthorized access" });
      }
      if (req.body.userId && req.body.userId !== review.userId && !req.admin) {
        return res.status(403).send({ error: "Unauthorized access" });
      }
      const updatedReview = {};
      for (const field of ReviewClientFields) {
        if (field !== "businessId" && field !== "userId") {
          updatedReview[field] = req.body[field];
        }
      }
      const result = await Review.update(updatedReview, {
        where: { id: reviewId },
      });
      if (result[0] > 0) {
        return res.status(200).send({
          message: "Review updated",
        });
      } else {
        return res.status(400).send({ error: "Failed to update review" });
      }
    } catch (e) {
      return next(e);
    }
  }
);

/*
 * Route to delete a review.
 */
router.delete(
  "/:reviewId",
  requireAuthentication,
  async function (req, res, next) {
    const reviewId = req.params.reviewId;
    try {
      const review = await Review.findOne({ where: { id: reviewId } });
      if (!review) {
        return res
          .status(404)
          .send({ error: `Review with id ${reviewId} does not exist.` });
      }
      if (req.user !== review.userId && !req.admin) {
        return res.status(403).send({ error: "Unauthorized access" });
      }
      const result = await Review.destroy({ where: { id: reviewId } });
      if (result > 0) {
        return res
          .status(200)
          .send({ message: `Review with id ${reviewId} has been deleted.` });
      } else {
        return res.status(400).send({ error: "Failed to delete Review." });
      }
    } catch (e) {
      return next(e);
    }
  }
);

module.exports = router;
