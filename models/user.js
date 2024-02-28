const { DataTypes } = require("sequelize");

const sequelize = require("../lib/sequelize");
const bcrypt = require("bcryptjs");

const User = sequelize.define("user", {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    set(value) {
      this.setDataValue("password", bcrypt.hashSync(value, 8));
    },
  },
  admin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
});
exports.User = User;

const createNewUser = async function createNewUser(
  name,
  email,
  password,
  admin
) {
  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return {
        error: "Email address already exists.",
      };
    }
    // Create a new user
    // const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const newUser = await User.create({
      name,
      email,
      password,
      admin,
    });
    return newUser;
  } catch (error) {
    return {
      error: "Failed to create a new user.",
    };
  }
};
exports.createNewUser = createNewUser;

// const getUserById = async function getUserById(id, includePassword) {
//   try {
//     const user = await User.findByPk(id, {
//       attributes: includePassword ? {} : { exclude: ["password"] },
//     });
//     if (user) {
//       return user;
//     }
//   } catch (error) {
//     return {
//       error: `User with id ${id} does not exist`,
//     };
//   }
// };
// exports.getUserById = getUserById;

const getUserByEmail = async function getUserByEmail(email) {
  try {
    const user = await User.findOne({ where: { email } });
    if (user) {
      return user;
    }
  } catch (error) {
    return {
      error: `User with id ${id} does not exist`,
    };
  }
};
exports.getUserByEmail = getUserByEmail;

const validateUser = async function validateUser(email, password) {
  const user = await getUserByEmail(email);
  if (
    user &&
    email === user.email &&
    (await bcrypt.compare(password, user.password))
  ) {
    return user;
  }
};
exports.validateUser = validateUser;

/*
 * Export an array containing the names of fields the client is allowed to set
 * on reviews.
 */
exports.UserClientFields = ["name", "email", "password"];
