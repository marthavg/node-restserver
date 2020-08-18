const express = require('express');

const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');


let app = express();

let Producto = require('../models/producto');
//const Categoria = require('../models/categoria');


// ==========================
// Obtener productos
// ==========================
app.get('/productos', verificaToken, (req, res) => {
    // trae todos los productos
    // populate: usuario categoria
    // paginado 

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({ disponible: true }, 'nombre precioUni descripcion disponible')
        .skip(desde)
        .limit(limite)
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {

            if (err) {
                res.status(500).json({
                    ok: false,
                    err
                });
            }

            Producto.count({ disponible: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    producto: productos,
                    cuantos: conteo
                });

            });
        });



});

// ==========================
// Obtener un producto por ID
// ==========================
app.get('/productos/:id', verificaToken, (req, res) => {
    // populate: usuario categoria
    // paginado (no hace falta)
    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El ID no es correcto'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });

        });

});


// ==========================
// Buscar productos
// ==========================
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;
    let regexp = new RegExp(termino, 'i')

    Producto.find({ nombre: regexp })
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productos) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El termino no es correcto'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productos
            });

        });
});


// ==========================
// Crear un nuevo producto
// ==========================
app.post('/productos', verificaToken, (req, res) => {
    // grabar el usuario
    // grabar una categoria del listado
    let body = req.body;
    let producto = new Producto({
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria

    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });

});

// ==========================
// Actualizar un producto
// ==========================
app.put('/productos/:id', verificaToken, (req, res) => {
    // grabar el usuario
    // grabar una categoria del listado
    let id = req.params.id;
    let body = req.body;

    // Producto.findById(id, (err, productoDB)=>{
    //     if(err){
    //         return res.status(500).json({
    //             ok: false,
    //             err
    //         });
    //     }

    //     if(!productoDB){
    //         return res.status(500).json({
    //             ok: false,
    //             err: {
    //                 message: 'El ID no existe'
    //             }
    //         });
    //     }

    //     productoDB.nombre = body.nombre;
    //     productoDB.precioUni = body.precioUni;
    //     productoDB.descripcion = body.descripcion;
    //     productoDB.disponible = body.disponible;
    //     productoDB.categoria = body.categoria;

    //     productoDB.save( (err, productoGuardado)=>{
    //         if(err){
    //             return res.status(500).json({
    //                 ok: false,
    //                 err
    //             });
    //         }

    //         res.json({
    //             ok: true,
    //             producto: productoGuardado
    //         });
    //     });


    // });


    let actProducto = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    };

    Producto.findByIdAndUpdate(id, actProducto, { new: true, runValidators: true }, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

// ============================
// Borrar un producto
// ============================
app.delete('/productos/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    // grabar el usuario
    // grabar una categoria del listado

    let id = req.params.id;

    let cambioEstado = {
        disponible: false
    };

    Producto.findByIdAndUpdate(id, cambioEstado, { new: true }, (err, productoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            message: 'El producto fue deshabilitado exitosamente',
            producto: productoBorrado
        });
    });


});





module.exports = app;