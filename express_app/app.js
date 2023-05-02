// import required modules and files
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Web3 = require('web3');
const router = express.Router();

// import routing middleware
const registrationRoutes = require('./routes/registrationRoutes');
const loginRoutes = require('./routes/loginRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const distributorRoutes = require('./routes/distributorRoutes');
const nodalAgencyRoutes = require('./routes/nodalAgencyRoutes');

// create express app
const app = express();

// configure app
dotenv.config({ path: 'C:/Users/Bharath/OneDrive/Desktop/Folders/KisanMitr-Dummy/.env' });
mongoose.connect(`mongodb+srv://asaprov:Iamneganyousob%40123@kisanmitr.ua2nz7t.mongodb.net/test`, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));
const infuraEndpoint = `https://goerli.infura.io/v3/249b5372912d478bab5cb978ff7f3302`;
const web3 = new Web3(new Web3.providers.HttpProvider(infuraEndpoint));

// create MongoDBStore instance
const MongoDBStore = require('connect-mongodb-session')(session);

const store = new MongoDBStore({
  uri: 'mongodb+srv://asaprov:Iamneganyousob%40123@kisanmitr.ua2nz7t.mongodb.net/test',
  collection: 'sessions'
});

// set up middleware
app.use(router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: 'x9F4Y39F2yr2jrvaLUMLevq',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
    store: store
  })
);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// set up routing middleware
app.get('/', (req, res) => {
  res.render('index');
});

app.use('/register', registrationRoutes);
app.use('/login', loginRoutes);
app.use('/farmer', farmerRoutes);
app.use('/distributor', distributorRoutes);
app.use('/nodal-agency', nodalAgencyRoutes);

app.get('/:role/register', (req, res) => {
  const { role } = req.params;
  if (role === 'farmer' || role === 'distributor' || role === 'nodal-agency') {
    res.render(`${role}/${role}-register`);
  } else {
    res.redirect('/register');
  }
});



// start server
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server listening on port ${process.env.PORT || 3000}`);
});