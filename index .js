et dbUsers = [
  {
    username: "anita",
    password: "192329",
    name: "Anita",
    email:"anita@utem.edu.my"
}]

let dbvisitor = [
  {
    _id:"v01",
    Name:"Aisyah",
    PhoneNumber:"0136785242",
    VistingPurpose:" Deliver Food",
    VisitingPerson:" Daus ",
    VisitedDate:"2023/10/10",
    TimeIn:" 16:00 PM",
    TimeOut:"17:00 PM",
    VehicleType:" Car "
  },
  
  {
    _id:"v02",
    Name:"Alifah",
    PhoneNumber:"0135674232",
    VistingPurpose:" Visit Friends",
    VisitingPerson:" Raj ",
    VisitedDate:"2023/06/5",
    TimeIn:" 10:00 AM",
    TimeOut:"12:00 PM",
    VehicleType:" Car "
  },
  {
    _id:"v03",
    Name:"Anita",
    PhoneNumber:"0123456789",
    VistingPurpose:" Deliver things",
    VisitingPerson:" Daus ",
    VisitedDate:"2023/10/9",
    TimeIn:" 15:00 PM",
    TimeOut:"19:00 PM",
    VehicleType:" Motorcycle "
  }]
  
  let dbVehicle = [
  {
    _id:"v01",
    VehicleType:" Motorcycle ",
    VehicleNo:"RAJ7655"
  },
  {
    _id:"v02",
    VehicleType:" Car",
    VehicleNo:"BQN3478"
  },
  {
    _id:"v03",
    VehicleType:" Car",
    VehicleNo:"CNR8644"
  }]
  
  let dbSecurity = [
  
  {
    _id:"s01",
    Name:"David",
    WorkShift:"Morning"
  },
  {
    _id:"s02",
    Name:"Jason",
    WorkShift:"Night"
  }]
  
  let dbHostel = [
  {
    _id:"h01",
    Name:"Satria",
    Block:"Lekir"
  },
  {
    _id:"h02",
    Name:"Satria",
    Block:"Lekiu"
  },
  {
    _id:"h03",
    Name:"Lestari",
    Block:"Block A"
  }]
  
  
  let dbBlock = [
  {
    _id:"b01",
    BlockName:"Tuah",
    Floor:"6",
    Room:"ST-T-6"
  },
  {
    _id:"b02",
    BlockName:"Lekir",
    Floor:"3",
    Room:"SL-L-3-"
  },
  {
    _id:"b03",
    BlockName:"Kasturi",
    Floor:"8",
    Room:"SK-K-8"
  }]
  

const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = 3000;
const jwt = require('jsonwebtoken');

// MongoDB connection URL
const uri = 'mongodb+srv://Alifah:PcKMcN2kbv0KjaWm@cluster0.ali2uob.mongodb.net/?retryWrites=true&w=majority';

// Create a new MongoClient
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB
client.connect()
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Define collection names
const usersCollection = 'users';
const visitorsCollection = 'visitors';
const securityCollection = 'security';
const hostelCollection = 'hostel';
const blockCollection = 'block';
const vehicleCollection = 'vehicle';

function login(username, password) {
  //let matchUser= dbUsers.find(user => user.username == username)
  let matchUser= dbUsers.find(x => x.username == username)
  if(!matchUser) return "User not found!"
  if(matchUser.password==password){
      return matchUser
  } else {
      return "Invalid password"
  }
} 



function generateToken(userData) {
  const token = jwt.sign(
    userData,
    'inipassword'
    
  );
  return token

}

function verifyToken(req, res, next) {
  let header = req.headers.authorization
  console.log(header)

  let token = header.split(' ')[1]

  jwt.verify(token, 'inipassword', function(err, decoded){
    if(err){
      res.send("Invalid Token")
    }

    req.user = decoded
    next()
  });

}

// User login
app.post('/user/login', async (req, res) => {
  const { username, password } = req.body;

  console.log(req.body)

  let result = login(
    req.body.username,
    req.body.password
  )
  let token = generateToken(result)
  res.send(token)

  try {
    const db = client.db('<database-name>');
    const user = await db.collection(usersCollection).findOne({ username, password });

    if (user) {
      res.send('User logged in successfully');
    } else {
      res.status(401).send('Invalid username or password');
    }
  } catch (error) {
    res.status(500).send('Error logging in');
  }
});

// User logout
app.post('/user/logout', (req, res) => {
  res.send('User logged out successfully');
});

// Create a visitor
app.post('/visitor', async (req, res) => {
  const visitorData = req.body;

  try {
    const db = client.db('<database-name>');
    await db.collection(visitorsCollection).insertOne(visitorData);
    res.send('Visitor created successfully');
  } catch (error) {
    res.status(500).send('Error creating visitor');
  }
});

// Update a visitor
app.put('/visitor/:id', async (req, res) => {
  const { id } = req.params;
  const visitorData = req.body;

  try {
    const db = client.db('<database-name>');
    await db.collection(visitorsCollection).updateOne({ _id: id }, { $set: visitorData });
    res.send('Visitor updated successfully');
  } catch (error) {
    res.status(500).send('Error updating visitor');
  }
});

// Delete a visitor
app.delete('/visitor/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const db = client.db('<database-name>');
    await db.collection(visitorsCollection).deleteOne({ _id: id });
    res.send('Visitor deleted successfully');
  } catch (error) {
    res.status(500).send('Error deleting visitor');
  }
});

// View all visitors
app.get('/visitor', async (req, res) => {
  try {
    const db = client.db('<database-name>');
    const visitors = await db.collection(visitorsCollection).find().toArray();
    res.send(visitors);
  } catch (error) {
    res.status(500).send('Error viewing visitors');
  }
});

// Security login
app.post('/security/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const db = client.db('<database-name>');
    const security = await db.collection(securityCollection).findOne({ username, password });

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
    const db = client.db('<database-name>');
    const visitor = await db.collection(visitorsCollection).findOne({ _id: id });

    if (visitor) {
      res.send(visitor.accessInfo);
    } else {
      res.status(404).send('Visitor not found');
    }
  } catch (error) {
    res.status(500).send('Error retrieving access information');
  }
});

// View all hostel
app.get('/hostel', async (req, res) => {
  try {
    const db = client.db('<database-name>');
    const hostel = await db.collection(hostelCollection).find().toArray();
    res.send(hostel);
  } catch (error) {
    res.status(500).send('Error viewing hostel');
  }
});

// View all block
app.get('/block', async (req, res) => {
  try {
    const db = client.db('<database-name>');
    const block = await db.collection(blockCollection).find().toArray();
    res.send(block);
  } catch (error) {
    res.status(500).send('Error viewing block');
  }
});

// View all vehicle
app.get('/vehicle', async (req, res) => {
  try {
    const db = client.db('<database-name>');
    const vehicle = await db.collection(vehicleCollection).find().toArray();
    res.send(vehicle);
  } catch (error) {
    res.status(500).send('Error viewing vehicle');
  }
});

app.use(express.json())

//login request
// app.post('/login', (req, res) => {
  
  
//   console.log(req.body)

//   let result = login(
//     req.body.username,
//     req.body.password
//   )
//   //res.send(result)

//   let token = generateToken(result)
//   res.send(token)
// })

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});