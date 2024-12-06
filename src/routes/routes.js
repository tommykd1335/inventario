const express = require('express')
const router = express.Router()
const articulos = require('../../models/articulos')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { type } = require('os')
const { resourceLimits } = require('worker_threads')

const carpetaUpload = path.join(__dirname, '../src/upload')

var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, carpetaUpload)
    },

    filename: function(req, file, cb){
        cb(null, Date.now() + file.originalname)
    }
})

var upload = multer({
    storage: storage
}).single('foto')

router.get('/',(req,res)=>{
    res.render('index', { titulo: 'Inicio'})
})

router.get('/add',(req,res)=>{
    res.render('addArticulo', { titulo: 'Agregar articulo'})
})

router.get('/inventario', (req, res) => {
    articulos.find() 
        .then((articulosEncontrados) => {
            res.render('inventario', { titulo: 'Inventario', articulos: articulosEncontrados }); 
        })
        .catch((error) => {
            console.log(error); 
            res.render('inventario', { titulo: 'Inventario', articulos: [] }); 
        });
});

router.post('/inventario', upload, (req, res)=>{
    const articulo = new articulos({
        codigo: req.body.codigo,
        nombre: req.body.nombre,
        foto: req.file.filename,
        descripcion: req.body.descripcion,
        cantidad: req.body.cantidad,
        precio: req.body.precio
    })

    articulo.save().then(()=>{
        req.session.message = {
            message: 'Usuario agragado correctamente!',
            type: 'success'
        }
        res.redirect('/inventario')

    }).catch((error)=>{
        res.json({
            message: error.message,
            type: 'danger'
        })
    })
})


//editar
router.get('/edit/:id', upload, async (req, res) =>{
    const id= req.params.id

    try{
        const articulo = await articulos.findById(id)
        if(articulo == null){
            res.redirect('/inventario')
        }
        else{
            res.render('editarArticulo',{
                titulo: 'Editar articulo',
                articulo: articulo
            })
        }
    }
    catch(error){
        res.status(500).send()
    }
    
})
router.post('/editar/:id', upload, async(req, res) => {
    const id = req.params.id;
    const nuevaImagen = ''
    if (req.file) {
        nuevaImagen = req.file.filename
        try{
            fs.unlinkSync('./upload/' + req.body.old_image)
        }
        catch(error){
            console.log(error)
        }     
    }
    else{
        nuevaImagen = req.body.old_image
    }
    try{
        await articulos.findByIdAndUpdate(id, {
            codigo: req.body.codigo,
            nombre: req.body.nombre,
            foto: nuevaImagen,
            descripcion: req.body.descripcion,
            cantidad: req.body.cantidad,
            precio: req.body.precio  
        })
        
        req.session.message = {
            message: 'Usuario editado correctamente!',
            type: 'success'
        }
        
        res.redirect('/inventario')

    }
    catch(error){
        res.json({
            message: error.message,
            type: 'danger'
        })
    }
});

// eliminar

router.get('/delete/:id', async(req, res)=>{
    const id = req.params.id
    try{
        const articulo = await articulos.findByIdAndDelete(id)
        if(articulo!= null && articulo.foto != ''){
            try{
                fs.unlinkSync('./upload/'+ resourceLimits.foto)
            }
            catch(error){
                console.log(error)
            }
        }
        req.session.message = {
            message: 'Usuario eliminado correctamente!',
            type: 'info'
        }
        res.redirect('/inventario')
    }
    catch(error){
        res.json({
            message: error.message,
            type: 'danger'
        })
    }
})
module.exports = router