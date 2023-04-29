const express = require('express');
const Web3 = require('web3');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');


const dotenv = require('dotenv');
const registrationRoutes = require('./routes/registrationRoutes');
const path = require('path');

const app = express();



app.use(session({
  secret: 'x9F4Y39F2yr2jrvaLUMLevq',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true } // set it to true if you are using https
}));



app.use(cookieParser());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));

dotenv.config({ path: 'C:/Users/Bharath/OneDrive/Desktop/Folders/KisanMitr-Dummy/.env' });

mongoose.connect(`mongodb+srv://asaprov:Iamneganyousob%40123@kisanmitr.ua2nz7t.mongodb.net/test`, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const infuraEndpoint = `https://goerli.infura.io/v3/249b5372912d478bab5cb978ff7f3302`;
const web3 = new Web3(new Web3.providers.HttpProvider(infuraEndpoint));

app.use('/', registrationRoutes);

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/:role/register', (req, res) => {
  const { role } = req.params;
  if (role === 'farmer' || role === 'distributor' || role === 'nodalAgency') {
    res.render(`${role}/${role}-register`);
  } else {
    res.redirect('/register');
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server listening on port ${process.env.PORT || 3000}`);
});
