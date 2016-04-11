//Dependencias
var restful = require('node-restful');
var mongoose = restful.mongoose;

//Schema
var userSchema = new mongoose.Schema({	 
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

//Retorna el modelo
module.exports = restful.model('User', userSchema);