const { Router } = require('express')
const { ValidationError } = require('sequelize')

const { Review, ReviewClientFields } = require('../models/review')

const router = Router()

/*
 * Route to create a new review.
 */
router.post('/', async function (req, res, next) {
  try {
    const review = await Review.create(req.body, ReviewClientFields)
    res.status(201).send({ id: review.id })
  } catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).send({ error: e.message })
    } else {
      next(e)
    }
  }
})

/*
 * Route to fetch info about a specific review.
 */
router.get('/:reviewId', async function (req, res, next) {
  const reviewId = req.params.reviewId
  try {
    const review = await Review.findByPk(reviewId)
    if (review) {
      res.status(200).send(review)
    } else {
      next()
    }
  } catch (e) {
    next(e)
  }
})

/*
 * Route to update a review.
 */
router.patch('/:reviewId', async function (req, res, next) {
  const reviewId = req.params.reviewId
  try {
    /*
     * Update review without allowing client to update businessId or userId.
     */
    const result = await Review.update(req.body, {
      where: { id: reviewId },
      fields: ReviewClientFields.filter(
        field => field !== 'businessId' && field !== 'userId'
      )
    })
    if (result[0] > 0) {
      res.status(204).send()
    } else {
      next()
    }
  } catch (e) {
    next(e)
  }
})

/*
 * Route to delete a review.
 */
router.delete('/:reviewId', async function (req, res, next) {
  const reviewId = req.params.reviewId
  try {
    const result = await Review.destroy({ where: { id: reviewId }})
    if (result > 0) {
      res.status(204).send()
    } else {
      next()
    }
  } catch (e) {
    next(e)
  }
})

module.exports = router
