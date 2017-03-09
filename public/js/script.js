$result_box = $('#result');

$.fn.myAddClass = function(value, callback) {
	setTimeout(callback, 1000);
	this.addClass(value);
};

var times_played, level, hscore, score, multiplier, interval,timeout;

function init(){
	times_played = 0;
	level = 1;
	score = 0;
	multiplier = 0;
	getHighScore();
}

function assignMultiplier(level){
	switch(level){
		case 1:
			multiplier = 4;
			break;

		case 2:
			multiplier = 8;
			break;

		case 3:
			multiplier = 12;
			break;

		case 4:
			multiplier = 16;
			break;

		case 5:
			multiplier = 20;
			break;
	}
}

function render(){
	$result_box.val('');
	var prevmultiplier = multiplier - 4 > 0 ? multiplier - 4 : 1 ;
	$('#num2').text(Math.floor(Math.random() * 12 + 1));
	$('#num1').text(Math.floor(Math.random() * (multiplier - prevmultiplier + 1) + prevmultiplier));	// quite difficult to explain, but trying to make sure the 
	//first number is between the limit of the prevmultiplier + 1 and multiplier.
	$('#score').text(score);
	$('#level').text(level);
	timeout = setTimeout(countDown, 5000);	
}

function progressGame(){
	times_played++;
	score += level;
	if(times_played % 5 == 0){  // increase the level after the player has played 5 times in a row.
		level++;
	}
	assignMultiplier(level);
}

function rightAnswer(){
	var num1 = $('#num1').text();
	var num2 = $('#num2').text();
	var result = num1 * num2;
	var user_answer = $result_box.val();
	return user_answer == result;
}

function countDown(){
	var count = 10;
	$('#countdown').text(count);
	$('#countdown').show('fast');
	interval = setInterval(function() {
	    count--;
	    $('#countdown').text(count);
	     if(count === 1 ) {
	    	clearInterval(interval);
	    	$('#countdown').stop().fadeOut('fast');
	    	notifyLose();
	    }
	}, 1000);
}

function notifyLose(){
	$('.quizbox').addClass('red_bg');
	$('#result').addClass('pink_bg');
	$('.quizbox').myAddClass('animated flash', function(){
		$('#result').addClass('red_text');
		$('#result').val($('#num1').text() * $('#num2').text());
		$('#submit').css('display', 'none');
		$('#wanna_continue_wrapper').css('display','inline');
	});
}

function getHighScore(){
	$.ajax({
		type: 'GET',
		url: 'http://localhost:3000/score',
		dataType: 'json',
		headers: {
			'Authenticated': 'Worthy'
		},
		success: function(data){
			console.log(data);
			hscore = data[0].score;
			$('#highscore').text(hscore);
		}
	});
}

function postHighScore(hscore, score){
	var goal = {};
	goal.prevScore = hscore;
	goal.newScore = score;
	if(score > hscore){
		$.ajax({
			type: 'POST',
			url: 'http://localhost:3000/score',
			data: goal,
			success: function(data){
				console.log(data);
			}
		});
	}
}

$(function(){
	getHighScore();
	init();
	render();
	
	function restart(){
		$('#wanna_continue_wrapper').css('display','none');
		$('#submit').css('display', 'inline');
		$('.quizbox').removeClass('animated flash');
		$('.quizbox').removeClass('red_bg');
		$('#result').removeClass('pink_bg');
		$('#result').removeClass('red_text');
		init();
		render();	
	};

	function submit(){
		clearInterval(interval);
		clearTimeout(timeout);
		$('#countdown').stop().fadeOut('fast');
		if(rightAnswer()){
			progressGame();
			render();
		}else{
			postHighScore(hscore, score);
			notifyLose();
		}
	}

	// $('#quit').on('click', function(){

	// });

	$('#result_container').on('submit', function(e){
		e.preventDefault();
		if($('#submit').css('display') != 'none'){
			submit();
		}else{
			restart();
		}
	});
});