// VARIABLES

var express = require('express');
var redis = require("redis"),
    client = redis.createClient();
var bodyParser = require("body-parser");
var app = express();
var wins = 0,
    losses = 0;

// BODY PARSER START

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

// REDIS CONNECTION

client.on("error", function(err) {
    console.log("Error " + err);
});

// CREATING WINS AND LOSSES IN REDIS DB

client.setnx("wins", 0, redis.print);
client.setnx("losses", 0, redis.print);

// ROUTES

app.get('/', function(req, res) {
    res.send('Hello World!');
});

app.get('/stats', function(req, res) {
    client.get("wins", function(err, reply) {
        wins = reply;
    });

    client.get("losses", function(err, reply) {
        losses = reply;
        res.json({
            "wins": wins,
            "losses": losses
        });
    });
});

app.delete('/stats', function(req, res) {
    wins = 0;
    losses = 0;
    client.set("wins", wins, redis.print);
    client.set("losses", losses, redis.print);
    res.json({
        "wins": wins,
        "losses": losses
    });
    res.end('yes');
});

app.post('/flip', function(req, res) {
    var call = req.body.call;
    var myArray = ['heads', 'tails'];
    var rand = myArray[Math.floor(Math.random() * myArray.length)];
    if (rand == call) {
        client.incr("wins", redis.print);
        res.json({
            "result": "win"
        });
    } else {
        client.incr("losses", redis.print);
        res.json({
            "result": "loss"
        });
    }
});

// APP START

app.listen(3000, function() {
    console.log('App listening on port 3000!');
});