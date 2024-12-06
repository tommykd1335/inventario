const express = require('express')
const router = express.Router()

router.get('/',(req,res)=>{
    res.render('index', { titulo: 'Inicio'})
})

router.get('/add',(req,res)=>{
    res.render('addArticulo', { titulo: 'Agregar articulo'})
})
router.get('/inventario',(req,res)=>{
    res.render('inventario', { titulo: 'Inventario'})
})
module.exports = router