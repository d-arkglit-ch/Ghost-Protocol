import express from 'express'
import http from "http"
const app=express();
import cookieParser from 'cookie-parser'
import cors from 'cors'
import userRouter from './routes/user.routes.js';
import roomRouter from './routes/room.routes.js';
import messageRouter from "./routes/message.routes.js"
import { initSocket } from './socket/socket.js';
const server = http.createServer(app)
//middleware setup
const allowedOrigins = [
    process.env.CORS_ORIGIN,
    "http://localhost:5173",
    "http://localhost:3000"
].filter(Boolean); // removes undefined if env is missing

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".vercel.app")) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}))
app.use(express.json({limit:"1mb"}))
app.use(express.urlencoded({extended:true }))
app.use(express.static("public"))
app.use(cookieParser())

//use middleware to connect to routes
app.use("/api/v1/users" , userRouter)
app.use("/api/v1/room" , roomRouter)
app.use("/api/v1/message" , messageRouter)
//setting up socket.io
const io = initSocket(server);
app.set("io", io);

import { startCleanupJob } from './utils/cleanup.js';
startCleanupJob();

export {app , server}