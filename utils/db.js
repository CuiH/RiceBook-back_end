const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

// mongoose.connect('mongodb://root:cuihao@localhost:27017/ricebook', { useMongoClient: true });
mongoose.connect('mongodb://root:cuihao@ds243085.mlab.com:43085/rice-book-server', { useMongoClient: true });

const conn = mongoose.connection;

conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', () => console.log("connected to mongodb."));
