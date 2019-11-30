let mongoose = require('mongoose');

// Pregunta Schema
let preguntaSchema = mongoose.Schema({
  pregunta:{
    type: String,
    required: true
  },
  opcion1:{
    type: String,
    required: true
  },
  opcion2:{
    type: String,
    required: true
  },
  opcion3:{
    type: String,
    required: true
  },
  opcion4:{
    type: String,
    required: true
  },
  respuesta:{
    type: Number,
    required: true
  },

});

let Pregunta = module.exports = mongoose.model('Pregunta', preguntaSchema);

