require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const router = require('./routes/routes')
const path = require('path')

const app = express()
const PORT = process.env.PORT|| 4000

mongoose.connect(process.env.DB_URI)
const db = mongoose.connection
db.on('error',(error) => console.log(error))
db.once('open', ()=> console.log('Conectado a la base de datos'))

app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use(session({
    secret:'mi palabra clave',
    saveUninitialized: true,
    resave: false
}))

app.use((req, res, next)=>{
    res.locals.message = req.session.message
    delete req.session.message
    next()
}) 

app.set('views', path.join(__dirname, './views'));
app.engine("ejs", require("ejs").__express); 
app.set('view engine', 'ejs')

//Ver imagenes

const carpetaUpload = path.join(__dirname, './upload');

app.use('/upload', express.static(carpetaUpload));

app.use('', router)

app.listen(PORT, ()=>{
    console.log(`servidor iniciado en ${PORT}`)
})
