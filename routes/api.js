/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const mongodb = require("mongodb");
const mongoose = require("mongoose");

const uri = "mongodb+srv://user:" + process.env["PASSWORD"] + "@cluster1.52mcawa.mongodb.net/personal_library_database?retryWrites=true&w=majority";

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: []
});

const Book = mongoose.model("Book", BookSchema);

module.exports = function(app) {

  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  app.route('/api/books')
    .get(async function(req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      let allBooks = [];
      await Book.find()
        .then((booksFound) => {
          booksFound.forEach((bookFound) => {
            //console.log(bookFound.title)
            let newObj = {};
            newObj["_id"] = bookFound._id;
            newObj["title"] = bookFound.title;
            newObj["commentcount"] = bookFound.comments.length;
            allBooks.push(newObj);
          });
          //console.log(allBooks);
        })
        .catch((err) => {
          console.log(err);
          return res.send("error while getting books");
        });
      return res.json(allBooks);
    })

    .post(function(req, res) {
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      // console.log(title);

      if (!title) {
        return res.send("missing required field title");
      };

      let newBook = new Book({
        title: title
      });

      newBook.save()
        .then((savedBook) => {
          return res.json(savedBook);
        })
        .catch((err) => {
          console.log(err);
          return res.send("error while saving");
        });
    })

    .delete(async function(req, res) {
      //if successful response will be 'complete delete successful'
      await Book.deleteMany({})
        .then((deletedBooks) => {
          res.send("complete delete successful");
        })
        .catch((err) => {
          console.log(err);
          res.send("error while deleting");
        });
    });



  app.route('/api/books/:id')
    .get(async function(req, res) {
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}

      await Book.findById(bookid)
        .then((bookFound) => {
          const returnObject = {
            title: bookFound.title,
            _id: bookFound._id,
            comments: bookFound.comments
          };
          return res.json(returnObject);
        })
        .catch((err) => {
          console.log(err);
          res.send("no book exists");
        });
    })

    .post(async function(req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get

      if (!comment) {
        return res.send("missing required field comment");
      };

      await Book.findByIdAndUpdate(bookid, { $push: { comments: comment } })
        .then((updatedBook) => {
          if (updatedBook) {
            let returnComments = updatedBook.comments
            returnComments.push(comment);
            const returnObject = {
              title: updatedBook.title,
              _id: updatedBook._id,
              comments: returnComments
            };
            return res.json(returnObject);
          } else {
            return res.send("no book exists");
          };
        })
        .catch((err) => {
          console.log(err);
          return res.send("no book exists");
        });
    })

    .delete(function(req, res) {
      let bookid = req.params.id;

      Book.findByIdAndRemove(bookid)
        .then((deletedBook) => {
          if (deletedBook) {
            return res.send("delete successful");
          } else {
            return res.send("no book exists");
          };
        })
        .catch((err) => {
          console.log(err);
          return res.send("no book exists");
        });
    });

};
