const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require("dotenv").config();

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes')
const HttpError = require('./models/http-error');

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://yourplaces-tmij.onrender.com');
    res.setHeader(
        'Access-Control-Allow-Headers', 
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Headers', 'GET, POST, PATCH, DELETE');
    next();
});

app.use('/api/places', placesRoutes); 
app.use('/api/users', usersRoutes); 

app.use((req, res, next) => { 
    const error = new HttpError('Could not find this route.', 404);
    throw error;
});

app.use((error, req, res, next) => {
    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            console.log(err);
        });
    }
    if (res.headerSent) {
        return next(error);
    }

    let statusCode = 500;

    if (error.statusCode) {
        statusCode = error.statusCode;
    }

    res.status(statusCode);
    res.json({ message: error.message || 'An unknown error occurred!' });
});

mongoose
    .connect(
        `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.tg3qw11.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`
    )
    .then(() => {
        app.listen(process.env.PORT || 5000); 
    })
    .catch((err) => {
        console.log(err);
    });