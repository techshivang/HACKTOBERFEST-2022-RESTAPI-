import express from 'express';
import { APP_PORT, DB_URL } from './config';
import errorHandler from './middlewares/errorHandler';
import routes from './routes';
import mongoose from 'mongoose';
import path from 'path';
const app = express();

// Database Connection
mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const DB = mongoose.connection;
DB.on('error', console.error.bind(console, 'connection error'));
DB.once('open', () => {
    console.log("Database Connected Successfully !!");
})

app.use("/uploads", express.static('uploads'));

// global
global.appRoot = path.resolve(__dirname);

// for multipart-data
app.use(express.urlencoded({ extended: false }));

// Register all routes
app.use(express.json());
app.use('/api', routes);
app.use(errorHandler);
app.listen(APP_PORT, () => {
    console.log(`Listening on Port :${APP_PORT}`);
})