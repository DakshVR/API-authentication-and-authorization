const { Router } = require("express");
const cors = require("cors");
const { ValidationError } = require("sequelize");

const { Photo, PhotoClientFields } = require("../models/photo");
const { requireAuthentication } = require("../lib/auth");
const router = Router();
router.use(cors());

/*
 * Route to create a new photo.
 */
router.post("/", requireAuthentication, async function (req, res, next) {
  const admin = req.admin;
  const userId = req.body.userId;

  if ((req.user && req.user == userId) || admin) {
    try {
      const photo = await Photo.create(req.body, PhotoClientFields);
      res.status(201).send({ id: photo.id });
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
 * Route to fetch info about a specific photo.
 */
router.get("/:photoId", async function (req, res, next) {
  const photoId = req.params.photoId;
  try {
    const photo = await Photo.findByPk(photoId);
    if (photo) {
      res.status(200).send(photo);
    } else {
      next();
    }
  } catch (e) {
    next(e);
  }
});

/*
 * Route to update a photo.
 */
router.put("/:photoId", requireAuthentication, async function (req, res, next) {
  const photoId = req.params.photoId;
  try {
    const photo = await Photo.findOne({ where: { id: photoId } });
    if (!photo) {
      return res
        .status(404)
        .send({ error: `Photo with id ${photoId} does not exist.` });
    }
    if (req.user !== photo.userId && !req.admin) {
      return res.status(403).send({ error: "Unauthorized access" });
    }
    if (req.body.userId && req.body.userId !== photo.userId && !req.admin) {
      return res.status(403).send({ error: "Unauthorized access" });
    }
    const updatedPhoto = {};
    for (const field of PhotoClientFields) {
      if (field !== "businessId" && field !== "userId") {
        updatedPhoto[field] = req.body[field];
      }
    }
    const result = await Photo.update(updatedPhoto, {
      where: { id: photoId },
    });
    if (result[0] > 0) {
      return res.status(200).send({
        message: "Photo updated",
      });
    } else {
      return res.status(400).send({ error: "Failed to update photo" });
    }
  } catch (e) {
    return next(e);
  }
});

/*
 * Route to delete a photo.
 */
router.delete(
  "/:photoId",
  requireAuthentication,
  async function (req, res, next) {
    const photoId = req.params.photoId;
    try {
      const photo = await Photo.findOne({ where: { id: photoId } });
      if (!photo) {
        return res
          .status(404)
          .send({ error: `Photo with id ${photoId} does not exist.` });
      }
      if (req.user !== photo.userId && !req.admin) {
        return res.status(403).send({ error: "Unauthorized access" });
      }
      const result = await Photo.destroy({ where: { id: photoId } });
      if (result > 0) {
        return res
          .status(200)
          .send({ message: `Photo with id ${photoId} has been deleted.` });
      } else {
        return res.status(400).send({ error: "Failed to delete photo" });
      }
    } catch (e) {
      return next(e);
    }
  }
);

module.exports = router;
