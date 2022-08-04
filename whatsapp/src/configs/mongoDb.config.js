const mongoose = require('mongoose');

require('dotenv').config();

class Database {

  constructor() {
    this.mongoUrl = `mongodb://localhost:27017/${process.env.MONGO_DATABASE_NAME}`;
  }

  _connect() {
    mongoose.connect(this.mongoUrl)
      .then(() => {
        console.log('Database connection successful');
      })
      .catch(err => {
        console.error('Database connection error',err);
      })
  }

  _closeConnection() {
    mongoose.connection.close(function () {
      console.log('MongoDb Connection has been successfully closed');
      process.exit(0);
    });
  }
};

module.exports = new Database();
