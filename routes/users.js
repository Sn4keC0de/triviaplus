const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Bring in User Model
let User = require('../models/user');

// pregunta Model
let Pregunta = require('../models/pregunta');

const MAX_PREG = 2;


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


////////////////////////////////////////////////////////////
// Preguntas
///////////////////////////////////////////////////////////
// Add Route
router.get('/add', ensureAuthenticated, function(req, res){
  Pregunta.find((err, items) => {
    console.log(items)
    preguntas = items;
    res.render('add_pregunta', {
      title:'Agregar pregunta',
      preguntas: preguntas
    });
  })
});

router.get('/cuestionario', ensureAuthenticated, function(req, res){
  Pregunta.find((err, items) => {
    console.log(items)
    user = req.user._id;
    preguntas = [];
    for (var i = 0; i < MAX_PREG; i++) {
//      let rnd = Math.floor( Math.random() * items.length);
//      preguntas.push(items[rnd]);
      preguntas.push(items[i]);
    }
    res.render('play', {
      title:'JUGAR',
      preguntas: preguntas,
      MAX_PREG: MAX_PREG,
      ite: items.length,
      itep: preguntas.length
    });
  })
});


// Ruta para agregar una pregunta
router.post('/add', ensureAuthenticated, function(req, res){
  req.checkBody('pregunta','La pregunta es requerida').notEmpty();
  req.checkBody('opcion1','Opcion 1 es requerida').notEmpty();
  req.checkBody('opcion2','Opcion 2 es requerida').notEmpty();
  req.checkBody('opcion3','Opcion 3 es requerida').notEmpty();
  req.checkBody('opcion4','Opcion 4 es requerida').notEmpty();
  req.checkBody('respuesta','Respuesta es requerida').notEmpty();

  // Recuperamos los errores
  let errors = req.validationErrors();

  if(errors){
    res.render('add_pregunta', {
      title:'Agregar pregunta',
      errors:errors
    });
  } else {
    let pregunta = new Pregunta();
    pregunta.pregunta = req.body.pregunta;
    pregunta.opcion1 = req.body.opcion1;
    pregunta.opcion2 = req.body.opcion2;
    pregunta.opcion3 = req.body.opcion3;
    pregunta.opcion4 = req.body.opcion4;
    pregunta.respuesta = req.body.respuesta;
    preguntas = [];

    pregunta.save(function(err){
      if(err){
        console.log(err);
        return;
      } else {
        Pregunta.find((err, items) => {
          console.log(items)
          preguntas = items;
          req.flash('success','Pregunta agregada');
          res.render('add_pregunta', {
            title:'Agregar pregunta', 
            preguntas: preguntas
          });
        })
      }
    });
  }
});

// Formulaio de edicion
router.get('/edit/:id', ensureAuthenticated, function(req, res){
  pregunta.findById(req.params.id, function(err, pregunta){
    if(pregunta.pregunta != req.user._id){
      req.flash('danger', 'No esta autorizado');
      return res.redirect('/');
    }
    res.render('edit_pregunta', {
      title:'Editar pregunta',
      pregunta:pregunta
    });
  });
});


router.get('/delete/:id', ensureAuthenticated, function(req, res) {
  if(!req.params.id){
    res.status(500).send();
  }

  let query = {_id:req.params.id}

  Pregunta.findById(req.params.id, function(err, pregunta){
      Pregunta.remove(query, function(err){
        if(err){
          console.log(err);
        }
        req.flash('success', 'Se elimino la pregunta');
        res.redirect('/preguntas/add');
        });
  });  
})


// Update Submit POST Route
router.post('/edit/:id', ensureAuthenticated, function(req, res){
  let pregunta = {};
  pregunta.title = req.body.title;
  pregunta.author = req.body.author;
  pregunta.body = req.body.body;

  let query = {_id:req.params.id}

  pregunta.update(query, pregunta, function(err){
    if(err){
      console.log(err);
      return;
    } else {
      req.flash('success', 'pregunta actualizadfa');
      res.redirect('/');
    }
  });
});


// Ruta para verificar las respuestas dadas
router.post('/cuestionario', ensureAuthenticated, function(req, res){

  let correctas = 0;
  let total = 0;
  let user = req.user._id;
  for (let ele in req.body) {
      id = ele.substr(5, 100);
      resp = req.body[ele];

      total++;
      Pregunta.findById(id, function(err, pregunta){
        if(pregunta.pregunta != req.user._id){
          req.flash('danger', 'No esta autorizado');
          return res.redirect('/');
        }
        if ( pregunta.respuesta == resp ) {
          correctas++;
        }
     });
    }
  
    console.log("CORRECTAS: " + correctas + " sobre " + total);
    res.render('play_result', {
      title:'Resultado',
      correctas: correctas,
      total: total
    });

});


// Access Control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Por favor, ingrese al sistema');
    res.redirect('/users/login');
  }
}




module.exports = router;
