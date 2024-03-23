const { Router } = require("express");
const cors = require("cors");
const { ValidationError } = require("sequelize");

const { Business } = require("../models/business");
const { Photo } = require("../models/photo");
const { Review } = require("../models/review");
const {
  User,
  createNewUser,
  getUserById,
  validateUser,
} = require("../models/user");

const {
  generateAuthToken,
  requireAuthentication,
  adminUser,
} = require("../lib/auth");

const router = Router();

router.use(cors());

/*
 * Route to list all of a user's businesses.
 */
router.get(
  "/:userId/businesses",
  requireAuthentication,
  async function (req, res, next) {
    const admin = await req.admin;
    const userId = req.params.userId;
    if (req.user == userId || admin) {
      try {
        const userBusinesses = await Business.findAll({
          where: { ownerId: userId },
        });
        res.status(200).json({
          businesses: userBusinesses,
        });
      } catch (e) {
        next(e);
      }
    } else {
      res.status(403).send({
        error: "Unauthorized To Access the specified resource",
      });
    }
  }
);

/*
 * Route to list all of a user's reviews.
 */
router.get(
  "/:userId/reviews",
  requireAuthentication,
  async function (req, res, next) {
    const admin = await req.admin;
    const userId = req.params.userId;
    if (req.user == userId || admin) {
      try {
        const userReviews = await Review.findAll({ where: { userId: userId } });
        res.status(200).json({
          reviews: userReviews,
        });
      } catch (e) {
        next(e);
      }
    } else {
      res.status(403).send({
        error: "Unauthorized To Access the specified resource",
      });
    }
  }
);

/*
 * Route to list all of a user's photos.
 */
router.get(
  "/:userId/photos",
  requireAuthentication,
  async function (req, res, next) {
    const userId = req.params.userId;
    const admin = await req.admin;
    if (req.user == userId || admin) {
      try {
        const userPhotos = await Photo.findAll({ where: { userId: userId } });
        res.status(200).json({
          photos: userPhotos,
        });
      } catch (e) {
        next(e);
      }
    } else {
      res.status(403).send({
        error: "Unauthorized To Access the specified resource",
      });
    }
  }
);

/*
 * Route to create a new user.
 */
router.post("/", adminUser, async function (req, res, next) {
  if (req.admin == false && req.body.admin == true) {
    return res.status(403).send("Forbidden Access");
  } else {
    try {
      const { name, email, password, admin } = req.body;
      if (!name || !email || !password) {
        return res.status(400).send({ error: "Missing required fields" });
      }
      // Create a new user
      const newUser = await createNewUser(name, email, password, admin);
      if (newUser.error) {
        return res.status(400).send({ error: newUser.error });
      }
      res.status(201).send({
        id: newUser.id,
        email: newUser.email,
        password: newUser.password,
      });
    } catch (e) {
      if (e instanceof ValidationError) {
        return res.status(400).send({ error: e.message });
      } else {
        next(e);
      }
    }
  }
});

/*
 * Route to Login for Users.
 */
router.post("/login", async function (req, res, next) {
  if (req.body && req.body.email && req.body.password) {
    try {
      const user = await validateUser(req.body.email, req.body.password);

      if (user) {
        const token = await generateAuthToken(user.id);
        res.status(200).send({
          token: token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        });
      } else {
        res.status(401).send({
          error: "Invalid Authentication Credentials!",
        });
      }
    } catch (e) {
      next(e);
    }
  } else {
    res.status(400).send({
      error: "Request Body Requires Email and Password.",
    });
  }
});

/*
 * Route to Get a user.
 */
router.get("/:id", requireAuthentication, async function (req, res, next) {
  const admin = await req.admin;
  if (req.user == req.params.id || admin) {
    try {
      const id = req.params.id;
      const user = await getUserById(id);
      if (user) {
        res.status(200).send(user);
      }
    } catch (e) {
      next(e);
    }
  } else {
    res.status(403).send({
      error: "Unauthorized To Access the specified resource",
    });
  }
});

module.exports = router;
