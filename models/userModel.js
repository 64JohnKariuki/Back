// userModel.js

const pool = require("../config/db");

const bcrypt = require("bcryptjs");
const authToken = require("../middleware/authToken");

exports.register = (email, password, name) => {
  return new Promise((resolve, reject) => {
    // First, check if the user with the provided email already exists
    pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          if (results.length > 0) {
            // User with this email already exists
            reject(new Error("User already exists"));
          } else {
            // User does not exist, proceed with registration
            // Hash the password before storing it
            bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
              if (hashErr) {
                reject(hashErr);
              } else {
                // Truncate hashed password to fit into VARCHAR(15) column
                // const truncatedHashedPassword = hashedPassword.substring(0, 15);
                pool.query(
                  "INSERT INTO users (email, password, name) VALUES (?,?,?);",
                  [email, hashedPassword, name],
                  (insertErr, result) => {
                    if (insertErr) {
                      reject(insertErr);
                    } else {
                      resolve(result);
                    }
                  }
                );
              }
            });
          }
        }
      }
    );
  });
};

exports.login = (email, password) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT user_id, password FROM users WHERE email = ?;",
      [email],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          if (result.length === 0) {
            // No user found with the provided email
            reject(new Error("Invalid email or password"));
          } else {
            const storedHashedPassword = result[0].password;
            // Compare the provided password with the stored hashed password
            bcrypt.compare(
              password,
              storedHashedPassword,
              (compareErr, isMatch) => {
                if (compareErr) {
                  reject(compareErr);
                } else if (!isMatch) {
                  // Passwords do not match
                  reject(new Error("Invalid email or password"));
                } else {
                  // Passwords match, authenticate the user
                  let userData = {
                    userId: result[0].userId,
                  };
                  const { token, refreshToken } =
                    generateAccessAndRefreshToken(userData);
                  userData.token = token;
                  // if refresh token gives cros error avoid passing refresh token in cookies & pass as nrml param
                  userData.refreshToken = refreshToken;

                  // res.cookie('jwt', refreshToken, {
                  //     httpOnly: true,
                  //     sameSite: 'None', secure: true,
                  //     maxAge: 24 * 60 * 60 * 1000
                  // });

                  let response = [userData];
                  resolve(response);
                }
              }
            );
          }
        }
      }
    );
  });
};

exports.userDetails = (userId) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM users WHERE user_id = ?";
    pool.query(query, [userId], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

exports.allUsers = () => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM users";
    pool.query(query, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
