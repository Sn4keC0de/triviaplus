const mongoose = require('mongoose');

// User Schema
const UserSchema = mongoose.Schema({
  nombre:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true
  },
  username:{
    type: String,
    required: true
  },
  password:{
    type: String,
    required: true
  },
  role: {
    type: String,
    required: false
  }
});

const Usuario = module.exports = mongoose.model('Usuario', UserSchema);
