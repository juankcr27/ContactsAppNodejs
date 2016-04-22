//Dependencias
var restful = require('node-restful');
var mongoose = restful.mongoose;

//Schema
var contactSchema = new mongoose.Schema({
	userid: String,
	firstname: { type: String, required: true },
	lastname: { type: String, required: true },
	phonenumber: { type: String, required: true },
	age: Number,
	address: String,
	email: { type: String, required: true },
	latitud: { type : String, required : true },
	longitud: { type : String, required : true }	
});

//Retorna el modelo
module.exports = restful.model('Contacts', contactSchema);