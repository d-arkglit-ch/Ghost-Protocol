import dotenv from 'dotenv'
dotenv.config({
    path:"./.env"
})
import {connectDB} from './db/index.js'
import {app , server} from './app.js'

connectDB()
.then(()=>{
    server.listen(process.env.PORT ||9000 , ()=>{
    console.log(`server is running as port ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log(`mongoDB ERRor : ${error}`)
})