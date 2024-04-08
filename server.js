const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const PORT = process.env.PORT || 8000;
const dbConnectionStr = process.env.DB_STRING;
const dbName = 'star-wars-quotes';

let db, collection;

MongoClient.connect(dbConnectionStr)
  .then(client => {
    console.log(`Connected to database`);
    db = client.db(dbName);
    collection = db.collection('quotes');

    // Middlewares
    app.set('view engine', 'ejs');
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(express.static('public'));
    app.use(cors());

    // Routes
    app.get('/', (req, res) => {
      collection.find().toArray()
        .then(quotes => {
          res.render('index.ejs', { quotes: quotes });
        })
        .catch(error => {
          console.error(error);
          res.status(500).send('Internal Server Error');
        });
    });

    app.post('/quotes', (req, res) => {
      collection.insertOne(req.body)
        .then(result => {
          res.redirect('/');
        })
        .catch(error => {
          console.error(error);
          res.status(500).send('Internal Server Error');
        });
    });

    app.put('/quotes', (req, res) => {
      collection.findOneAndUpdate(
        { name: 'Yoda' },
        {
          $set: {
            name: req.body.name,
            quote: req.body.quote
          }
        },
        {
          upsert: true
        }
      )
        .then(result => res.json('Success'))
        .catch(error => {
          console.error(error);
          res.status(500).send('Internal Server Error');
        });
    });

    app.delete('/quotes', (req, res) => {
      collection.deleteOne(
        { name: req.body.name }
      )
        .then(result => {
          if (result.deletedCount === 0) {
            return res.json('No quote to delete');
          }
          res.json('Deleted Darth Vader\'s quote');
        })
        .catch(error => {
          console.error(error);
          res.status(500).send('Internal Server Error');
        });
    });

    // Listen
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  })
  .catch(error => {
    console.error('Database connection error:', error);
  });
