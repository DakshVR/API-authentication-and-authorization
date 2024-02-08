## 1. Implemented an API endpoint for creating new users
It stores the following information for each user:
  * `id` - The primary key for the user
  * `name` - User's full name
  * `email` - User's email address
  * `password` - User's hashed/salted password
  * `admin` - A boolean flag indicating whether the user has administrative permissions (`false` by default)

Hash and salt users' passwords before storing them in your database.  

## 2. Enabled JWT-based user logins and implement a user data access endpoint

`POST /users/login` API endpoint allows a registered user to log in by sending their email address and password.  If the email/password combination is valid, respond with a JWT token, which the user can then send with future requests to authenticate themselves.  The JWT token payload contains the user's ID (with which we are able to fetch details about the user from the database) and any other information needed and it expires after 24 hours.

If a user attempts to log in with an invalid username or password, respond with a 401 error.

`GET /users/{userId}` API endpoint returns information about the specified user (excluding their password).

## 3. Require authorization to perform certain API actions

Once users can log in, following authorization scheme:
  * Only an authorized user can see their own user data and their own lists of businesses, reviews, and photos.  In other words, the following API endpoints verifies that the `userId` specified in the URL path matches the ID of the logged-in user (as indicated by a valid JWT provided by the client):
    * `GET /users/{userId}`
    * `GET /users/{userId}/businesses`
    * `GET /users/{userId}/photos`
    * `GET /users/{userId}/reviews`

  * Only an authorized user can create new businesses, reviews, and photos.  In other words, the following API endpoints ensures that a user is logged in and that the user ID specified in the POST request body matches the ID of the logged-in user:
    * `POST /businesses`
    * `POST /photos`
    * `POST /reviews`

  * Only an authorized user can modify or delete their own businesses, reviews, and photos.  In other words, the following API endpoints ensures that a user is logged in and that the user ID for the entity being modified/deleted matches the ID of the logged-in user:
    * `PUT /businesses`, `DELETE /businesses`
    * `PUT /photos`, `DELETE /photos`
    * `PUT /reviews`, `DELETE /reviews`

  * A user with `admin` permissions can perform any action, including creating content or fetching/modifying/deleting the content of any user.

  * Only a user with `admin` permissions may create other `admin` users, i.e. the creation of `admin` users must be accompanied by a valid JWT for a logged-in `admin` user.

All authorized endpoints responds with an error if the logged-in user is not authorized or if no user is logged in (i.e. no JWT is provided).
