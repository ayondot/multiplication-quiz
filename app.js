var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var app = express();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/test');

app.use(express.static(path.join(__dirname, 'public')));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authenticated");
  next();
});

var HighScore = mongoose.model('Score', new Schema({
	score: Number
}));

app.get('/', function(req, res){
	res.sendFile('index.html', {root: __dirname + '/public/html'});
});

app.get('/score', function(req, res){
	HighScore.find({}, function(err, data){
		res.json(data);
	});
});

app.post('/score', function(req, res){
	console.log(req.body);
	HighScore.findOneAndUpdate({
		score : req.body.prevScore
	}, 
	{ $set: 
		{ score : req.body.newScore }
	},
	function(err, score){
		if(err){
			console.log('Error occured');
		}else{
			console.log(score);
		}
	});	
});

app.listen(3000, function(){
	console.log('Listening on port 3000');
})