'use strict';
const routeHandler = require("./api/routes");
var express = require('express');
var mongoose = require('mongoose');

var cors = require('cors');
var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

//Connect to the DB
mongoose.connect(process.env.MLAB_URI, { useNewUrlParser: true })

app.use(express.json());
app.use(cors());

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.use(express.static("public"));
app.use("/api/shorturl/", routeHandler);
app.use((req, res) => {
  res.status(400).json({
    msg: "no such route"
  });
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});