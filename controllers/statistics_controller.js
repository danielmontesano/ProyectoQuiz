var models = require('../models/models.js');

exports.show = function(req, res) {
	models.Quiz.findAll().then(function(quizes){

		var question_number = quizes.length;

		var max_id = quizes[quizes.length-1].id;

		models.Comment.findAll().then(function(comments){

			var comment_number = comments.length;
			var comment_average = comment_number/question_number;
			var commented_questions = 0;
			var uncommented_questions = 0;
			for (id in quizes) {
				for (i in comments){
					console.log(comments[i].QuizId);
					if (comments[i].QuizId == id) {
						commented_questions++;
						continue;
					}
				}
			}
			uncommented_questions = question_number - commented_questions;	
				res.render('statistics.ejs', {
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