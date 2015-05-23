var models = require('../models/models.js');

exports.show = function(req, res) {
	models.Quiz.findAll().then(function(quizes){

		var question_number = quizes.length;

		models.Comment.findAll().then(function(comments){

			var comment_number = comments.length;
			var comment_average = comment_number/question_number;
			var commented_questions = 0;
			var uncommented_questions = 0;
			var visited = [];
			for (x in comments) {
				if ((comments[x].QuizId !== null) && (visited.indexOf(comments[x].QuizId) === -1)){
					visited.push(comments[x].QuizId);
				}
			}
			commented_questions = visited.length;
			console.log(commented_questions);
			uncommented_questions = question_number - commented_questions;	
			res.render('quizes/statistics.ejs', {
				question_number: question_number, 
				comment_number: comment_number,
				comment_average: comment_average,
				commented_questions: commented_questions,
				uncommented_questions: uncommented_questions,
				errors: []
			});
		});
	});

}