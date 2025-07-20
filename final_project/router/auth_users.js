const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
let users = [];
const isValid = (username) => {
  return users.some((user) => user.username === username);
};

// Check if username and password match
const authenticatedUser = (username, password) => {
  return users.find((user) => user.username === username && user.password === password);
};

// Task 7: Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const user = authenticatedUser(username, password);
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Create a JWT token
  const token = jwt.sign({ username }, 'access', { expiresIn: '1h' });

  // Store token and username in session
  req.session.authorization = {
    token,
    username,
  };

  return res.status(200).json({ message: "Login successful", token });
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;

  let username;

  if (req.session && req.session.authorization && req.session.authorization.username) {
    username = req.session.authorization.username;
  } else if (req.headers.cookie) {
    try {
      const tokenCookie = req.headers.cookie
        .split("; ")
        .find((c) => c.startsWith("authorization="));

      if (tokenCookie) {
        const tokenData = decodeURIComponent(tokenCookie.split("=")[1]);
        const parsed = JSON.parse(tokenData);
        username = parsed.username;
      }
    } catch (err) {
      return res.status(401).json({ message: "Invalid cookie/session format" });
    }
  }

  if (!username) {
    return res.status(401).json({ message: "User not logged in or session invalid" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
});


// Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review by this user not found" });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
