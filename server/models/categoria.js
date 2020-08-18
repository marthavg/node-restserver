const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let categoriaSchema = new mongoose.Schema({
    descripcion: {
        type: String,
        unique: true,
        required: [true, 'La descripción es necesario']
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    }

});


module.exports = mongoose.model('Categoria', categoriaSchema);