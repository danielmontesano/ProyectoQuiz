var path = require('path');

//Postgres DATABASE_URL = postgress://user:passwd@host:port/database
//SQlite   DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name 	= (url[6]||null);
var user 		= (url[2]||null);
var pwd 		= (url[3]||null);
var protocol 	= (url[1]||null);
var dialect 	= (url[1]||null);
var port 		= (url[5]||null);
var host 		= (url[4]||null);
var storage 	= process.env.DATABASE_STORAGE;

//Cargar modelo ORM
var Sequelize = require('sequelize');

//User BBDD SQlite o Postgress
var sequelize = new Sequelize(DB_name, user, pwd,
	{	dialect: dialect, 
		protocol: protocol,
		port: port,
		host: host,
		storage: storage,
		omitNULL: true 
	}
);

// var sequelize = new Sequelize(null, null, null,
// 				{dialect: "sqlite", storage: "quiz.sqlite"}
// 				);

//Importar la definicion de la tabla quiz en quiz.js
var Quiz = sequelize.import(path.join(__dirname, 'quiz'));

var comment_path = path.join(__dirname, 'comment');
var Comment = sequelize.import(comment_path);

var user_path = path.join(__dirname, 'user');
var User = sequelize.import(user_path);

var favourite_path = path.join(__dirname, 'favourite');
var Favourites = sequelize.import(favourite_path);

Comment.belongsTo(Quiz);
Quiz.hasMany(Comment, {onDelete: 'cascade', hooks:true});

Quiz.belongsTo(User);
User.hasMany(Quiz);

User.belongsToMany(Quiz, {through: 'Favourites', as: 'Favourites' });
Quiz.belongsToMany(User, {through: 'Favourites', as: 'Fans' });

exports.Quiz = Quiz; //exportar definicion de tabala Quiz
exports.Comment = Comment;
exports.User = User;
exports.Favourites = Favourites;

// sequelize.sync() crea e inicializa tabala de preguntas en DB
sequelize.sync().then(function() {
	//sucess(..) ejecuta el manejador una vez creada la tabla
	User.count().then(function(count){
		if(count === 0) {
			User.bulkCreate(
				[ {	username: 'admin', password: '1234', isAdmin: true},
					{username: 'pepe', password: '1234'}
				]).then(function(){
					console.log('Base de datos (tabla user) inicializada');
					Quiz.count().then(function (count){
						if(count === 0) { //la tabala de inicializa solo si esta vacia
							Quiz.bulkCreate(
								[{pregunta: 'Capital de Italia', respuesta: 'Roma', UserId: 2},
								{pregunta: 'Capital de Francia', respuesta: 'Paris', UserId: 2}
								]
							).then(function(){console.log('Base de datos (tabla quiz) inicializada')});
						};
					});
				});
		};
	});
});