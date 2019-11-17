const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Bring in User Model
let User = require('../models/user');

// Register Form
router.get('/register', function(req, res){
  res.render('register');
});

// Register Proccess
router.post('/register', function(req, res){
  const nombre = req.body.nombre;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  // Valido que todos los datos del registro sean 
  //   correctos, no esten vacios y que las claves
  //   tanto la clave con la confirmacion coincidan
  req.checkBody('nombre', 'El nombre es requerido').notEmpty();
  req.checkBody('email', 'El email es requerido').notEmpty();
  req.checkBody('email', 'Email invalido').isEmail();
  req.checkBody('username', 'El Nick es requerido').notEmpty();
  req.checkBody('password', 'Password es requerido').notEmpty();
  req.checkBody('password2', 'Los passwords no coinciden').equals(req.body.password);

  // Ejecuto la validacion
  let errors = req.validationErrors();

  if(errors){
    // Si hay errores, devuelvo los errores encontrados
    res.render('register', {
      errors:errors
    });
  } else {
    // Si esta todo OK, genero el usuario en el MODEL
    let newUser = new User({
      nombre:nombre,
      email:email,
      username:username,
      password:password
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
          if(err){
            console.log(err);
            return;
          } else {
            req.flash('success','Se ha registrado con exito. Ya puede ingresar');
            res.redirect('/users/login');
          }
        });
      });
    });
  }
});

// Formulario de Login 
router.get('/login', function(req, res){
  res.render('login');
});

// Proceso de Login 
router.post('/login', function(req, res, next){
  console.log(req);
  passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/users/login',
    failureFlash: true
  })(req, res, next);
});

// logout
router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'Ud. ha salido del sistema');
  res.redirect('/users/login');
});

module.exports = router;
