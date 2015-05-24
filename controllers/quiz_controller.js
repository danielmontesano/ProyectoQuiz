var models = require('../models/models.js');

exports.load = function(req, res, next, quizId) {
	models.Quiz.find({
			where: {id: Number(quizId)},
			include: [{model: models.Comment}]
		}).then(
		function(quiz){
			if (quiz) {
				req.quiz = quiz;
				next();
			} else {
				next(new Error('No existe quizId=' + quizId));
			}
		}).catch(function(error) { next(error);});
};

//GET /quizes/question
exports.show = function(req, res) {
	res.render('quizes/show', {quiz: req.quiz, errors: []});
};

//GET /quizes/:id/answer
exports.answer = function(req, res) {
	var resultado = 'Incorrecto';
		if (req.query.respuesta === req.quiz.respuesta){
			resultado = 'Correcto';
		} 
		res.render('quizes/answer', { quiz: req.quiz, respuesta: resultado, errors: []});
}; 

exports.index = function(req, res, next) {
	var options = {};
	if(req.user){
		options.where = {UserId: req.user.id}
	}

	if (req.query.search!=null) {
		var busqueda = ('%' + req.query.search.replace(' ', '%') + '%');
		var preguntas = models.Quiz.findAll({where: ["pregunta like ?", busqueda], order: 'pregunta ASC'});

		preguntas.then(function(quizes){
		res.render('quizes/index.ejs', { quizes: quizes, errors: []});
		}).catch(function(error){next(error)});
	} else {
	models.Quiz.findAll(options).then(function(quizes){
		res.render('quizes/index.ejs', { quizes: quizes, errors: []});
	}).catch(function(error){next(error)});
	}
};

exports.new = function(req, res) {
	var quiz = models.Quiz.build(
		{pregunta: "Pregunta", respuesta: "Respuesta"}
		);
	res.render('quizes/new', {quiz: quiz, errors: []});
};

exports.create = function(req, res) {
	req.body.quiz.UserId = req.session.user.id;
	if(req.files.image){
		req.body.quiz.image = req.files.image.name;
	}
	var quiz = models.Quiz.build(req.body.quiz);

	quiz
	.validate()
	.then(
		function(err) {
			if (err) {
				res.render('quizes/new', {quiz: quiz, errors: err.errors});
			} else {
				quiz.save({fields: ["pregunta", "respuesta", "UserId", "image"]})
				.then(function(){
					res.redirect('/quizes');})
				}
			}
	);
};

exports.edit = function(req, res) {
	var quiz = req.quiz;

	res.render('quizes/edit', {quiz: quiz, errors: []});
};

exports.update = function(req, res) {
	if(req.files.image){
		req.quiz.image = req.files.image.name;
	}
	req.quiz.pregunta = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;

	req.quiz.validate().then(
		function(err) {
			if (err) {
				res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
			} else {
				req.quiz.save({fields: ["pregunta", "respuesta"]})
				.then( function() { res.redirect('/quizes');});
			}
		});
};

exports.destroy = function(req, res) {
	req.quiz.destroy().then( function() {
		res.redirect('/quizes');
	}).catch(function(error){next(error)});
};

exports.ownershipRequired = function(req, res, next) {
	var objQuizOwner = req.quiz.UserId;
	var logUser = req.session.user.id;
	var isAdmin = req.session.user.isAdmin; 

	if (isAdmin || objQuizOwner === logUser) {
		next();
	} else {
		res.redirect('/');
	}
};