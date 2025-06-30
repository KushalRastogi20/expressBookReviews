const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios')
// Task 1: Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Task 3: Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  const filteredBooks = [];

  for (let isbn in books) {
    if (books[isbn].author.toLowerCase() === author) {
      filteredBooks.push({ isbn, ...books[isbn] });
    }
  }

  if (filteredBooks.length > 0) {
    return res.status(200).json(filteredBooks);
  } else {
    return res.status(404).json({ message: "No books found for this author" });
  }
});

// Task 4: Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  const filteredBooks = [];

  for (let isbn in books) {
    if (books[isbn].title.toLowerCase() === title) {
      filteredBooks.push({ isbn, ...books[isbn] });
    }
  }

  if (filteredBooks.length > 0) {
    return res.status(200).json(filteredBooks);
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    const userExists = users.some((user) => user.username === username);
  
    if (userExists) {
      return res.status(409).json({ message: "Username already exists" });
    }
  
    users.push({ username, password });
    return res.status(200).json({ message: "User registered successfully" });
  });
  
//Task 10 axios imported at top using require

public_users.get('/async-books', async (req, res) => {
    try {
      const response = await axios.get('http://localhost:5000/'); // Local server
      return res.status(200).json(response.data);
    } catch (err) {
      return res.status(500).json({ message: 'Error fetching book list' });
    }
  });

//Task 11: Get book by ISBN using async/await

public_users.get('/async-isbn/:isbn', async (req, res) => {
  const { isbn } = req.params;
  try {
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(404).json({ message: 'Book not found' });
  }
});

//Task 12 get books by author using async/await
public_users.get('/async-author/:author', async (req, res) => {
    const { author } = req.params;
    try {
      const response = await axios.get(`http://localhost:5000/author/${author}`);
      return res.status(200).json(response.data);
    } catch (err) {
      return res.status(404).json({ message: 'No books found for this author' });
    }
  });
  //task 13 get books by title using async/a
  public_users.get('/async-title/:title', async (req, res) => {
    const { title } = req.params;
    try {
      const response = await axios.get(`http://localhost:5000/title/${title}`);
      return res.status(200).json(response.data);
    } catch (err) {
      return res.status(404).json({ message: 'No books found for this title' });
    }
  });
  
module.exports.general = public_users;
