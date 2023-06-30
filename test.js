const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = 5000;
const jwt = require('jsonwebtoken');
const { ObjectID } = require('mongodb');


// MongoDB connection URL
const uri =
  'mongodb+srv://Alifah:PcKMcN2kbv0KjaWm@cluster0.ali2uob.mongodb.net/VisitorManagement';

// Create a new MongoClient
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB
client
  .connect()
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Define collection names
const db = client.db('VisitorManagement');
const usersCollection = db.collection('users'); // Updated collection name
const visitorsCollection = db.collection('visitors');
const securityCollection = db.collection('security');
const hostelCollection = db.collection('hostel');
const blockCollection = db.collection('block');
const vehicleCollection = db.collection('vehicle');

function login(username, password) {
  return usersCollection.findOne({ username })
    .then((user) => {
      if (!user) {
        throw new Error('User not found!');
      }
      if (user.password === password) {
        return user;
      } else {
        throw new Error('Invalid password');
      }
    });
}

function register(username, password) {
  const newUser = {
    username,
    password,
  };

  return usersCollection
    .insertOne(newUser)
    .then(() => {
      return 'User registered successfully';
    })
    .catch((error) => {
      throw new Error('Error registering user');
    });
}

function generateToken(userData) {
  const token = jwt.sign(userData, 'inipassword');
  return token;
}

function verifyToken(req, res, next) {
  let header = req.headers.authorization;
  console.log(header);

  let token = header.split(' ')[1];

  jwt.verify(token, 'inipassword', function (err, decoded) {
    if (err) {
      res.send('Invalid Token');
    }

    req.user = decoded;
    next();
  });
}

// Apply JSON middleware
app.use(express.json());

// User registration
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  register(username, password)
    .then(() => {
      res.send('User registered successfully');
    })
    .catch((error) => {
      res.status(500).send('Error registering user');
    });
});

// User login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  login(username, password)
    .then((user) => {
      let token = generateToken(user);
      res.send(token);
    })
    .catch((error) => {
      res.status(401).send(error.message);
    });
});

// User logout
app.post('/user/logout', (req, res) => {
  res.send('User logged out successfully');
});

// Create a visitor
// Create a visitor
// Create a visitor
app.post('/visitorData', verifyToken, (req, res) => {
  const {
    visitorID,
    name,
    phoneNumber,
    visitingPurpose,
    visitingPerson,
    visitedDate,
    timeIn,
    timeOut,
    vehicleType
  } = req.body;

  const visitorData = {
    visitorID,
    name,
    phoneNumber,
    visitingPurpose,
    visitingPerson,
    visitedDate,
    timeIn,
    timeOut,
    vehicleType
  };

  visitorsCollection
    .insertOne(visitorData)
    .then(() => {
      res.send(visitorData);
    })
    .catch((error) => {
      console.error('Error creating visitor:', error);
      res.status(500).send('An error occurred while creating the visitor');
    });
});

// Update a visitor
app.put('/visitor/:id', async (req, res) => {
  const { id } = req.params;
  const visitorData = req.body;

  try {
    await visitorsCollection.updateOne({ _id: id }, { $set: visitorData });
    res.send('Visitor updated successfully');
  } catch (error) {
    res.status(500).send('Error updating visitor');
  }
});

// Delete a visitor
app.delete('/visitor/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const visitorObjectId = ObjectID(id);
    const deleteResult = await db.collection(visitorsCollection).deleteOne({ _id: visitorObjectId });

    if (deleteResult.deletedCount === 1) {
      res.send('Visitor deleted successfully');
    } else {
      res.status(404).send('Visitor not found');
    }
  } catch (error) {
    console.error('Error deleting visitor:', error);
    res.status(500).send('Error deleting visitor');
  }
});


// View all visitors
app.get('/visitor', async (req, res) => {
  try {
    const visitors = await visitorsCollection.find().toArray();
    res.send(visitors);
  } catch (error) {
    res.status(500).send('Error viewing visitors');
  }
});

// Security login
app.post('/security/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const security = await securityCollection.findOne({ username, password });

    if (security) {
      res.send('Security logged in successfully');
    } else {
      res.status(401).send('Invalid username or password');
    }
  } catch (error) {
    res.status(500).send('Error logging in');
  }
});

// Security logout
app.post('/security/logout', (req, res) => {
  res.send('Security logged out successfully');
});

// Visitor access information
app.get('/visitor/:id/access-info', async (req, res) => {
  const { id } = req.params;

  try {
    const visitor = await visitorsCollection.findOne({ _id: id });

    if (visitor) {
      res.send(visitor.accessInfo);
    } else {
      res.status(404).send('Visitor not found');
    }
  } catch (error) {
    res.status(500).send('Error retrieving access information');
  }
});

// View all hostels
app.get('/hostel', async (req, res) => {
  try {
    const hostels = await hostelCollection.find().toArray();
    res.send(hostels);
  } catch (error) {
    res.status(500).send('Error viewing hostels');
  }
});

// View all blocks
app.get('/block', async (req, res) => {
  try {
    const blocks = await blockCollection.find().toArray();
    res.send(blocks);
  } catch (error) {
    res.status(500).send('Error viewing blocks');
  }
});

// View all vehicles
app.get('/vehicle', async (req, res) => {
  try {
    const vehicles = await vehicleCollection.find().toArray();
    res.send(vehicles);
  } catch (error) {
    res.status(500).send('Error viewing vehicles');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
