//require('dotenv').config()

const express = require('express')
const app = express()

const cors = require('cors')
// core = require('./src/controlers/core')
const port = process.env.PORT || 8080
// configurar cors con la direccion del front
app.use(cors({origin: '*'}))
app.use(express.urlencoded({extended: false}))
app.use(express.json());

//Routes

app.use(require('./src/routes/main'))



// const start = async () => {
//     try {
//         await core.db.authenticate();
//         console.log(`Connection to DB  in ${process.env.NODE_ENV} mode has been established successfully`);
//     } catch (error) {
//         console.error('Unable to connect to the database:', error);
//     }
// }

// Start Server

app.listen(port, () => {
    console.log(`Server is power ⚡ on localhost:${port}`)
    // start().catch((error) => {
    //     console.error(error)
    // })
})

