const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');
let User = require('./models/user');
const bcrypt = require('bcryptjs');

mongoose.connect(config.database);
let db = mongoose.connection;

// Check connection
db.once('open', function(){
  console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', function(err){
  console.log(err);
});

// Init App
const app = express();

// Bring in Models
let pregunta = require('./models/pregunta');

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});

// Home Route
app.get('/', function(req, res){
  pregunta.find({}, function(err, preguntas){
    if(err){
      console.log(err);
    } else {
      res.render('index', {
        title:'Juego de Trivia (plus)',
        preguntas: preguntas
      });
    }
  });
});

// Route Files
// let preguntas = require('./routes/preguntas');
let users = require('./routes/users');
app.use('/users', users);
// app.use('/preguntas', preguntas);

let newUser = new User({
  nombre:'admin',
  email:'admin@admin.com',
  username:'admin',
  password:'admin',
  role:'admin'
});

// Encripto la clave
bcrypt.genSalt(10, function(err, salt){
  bcrypt.hash(newUser.password, salt, function(err, hash){
    if(err){
      console.log(err);
    }
    // Le asigno la clave encriptada
    newUser.password = hash;

    // Grabo el nuevo usuario
    newUser.save(function(err){
    });
  });
});



// Start Server
app.listen(3000, function(){
  console.log('Server started on port 3000...');
});
