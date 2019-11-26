const express = require('express');
const router = express.Router();
const MAX_PREG = 2;


// pregunta Model
let Pregunta = require('../models/pregunta');
// User Model
let User = require('../models/user');

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


// Add Submit POST Route
router.post('/add', function(req, res){
  req.checkBody('pregunta','La pregunta es requerida').notEmpty();
  req.checkBody('opcion1','Opcion 1 es requerida').notEmpty();
  req.checkBody('opcion2','Opcion 2 es requerida').notEmpty();
  req.checkBody('opcion3','Opcion 3 es requerida').notEmpty();
  req.checkBody('opcion4','Opcion 4 es requerida').notEmpty();
  req.checkBody('respuesta','Respuesta es requerida').notEmpty();

  // Get Errors
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
router.post('/edit/:id', function(req, res){
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

// Delete pregunta
/*
router.delete('/:id', function(req, res){
  if(!req.user._id){
    res.status(500).send();
  }

  let query = {_id:req.params.id}

  pregunta.findById(req.params.id, function(err, pregunta){
    if(pregunta._id != req.user._id){
      res.status(500).send();
    } else {
      pregunta.remove(query, function(err){
        if(err){
          console.log(err);
        }
        res.send('Success');
      });
    }
  });
});
*/

// Get Single pregunta
router.get('/:id', function(req, res){
/*
  pregunta.findById(req.params.id, function(err, pregunta){
    User.findById(pregunta.author, function(err, user){
      res.render('pregunta', {
        pregunta:pregunta,
        author: user.name
      });
    });
  });
  */
});


/*
router.get('/cuestionario', ensureAuthenticated, function(req, res){
  res.render('add_xxxxx', {
    title:'Agregar pregunta'
  });
});
*/

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
