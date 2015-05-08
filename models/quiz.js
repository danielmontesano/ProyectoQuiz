//Definicion del modelo de Quiz

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('QUiz',
			{	pregunta: DataTypes.STRING,
				respuesta: DataTypes.STRING,
			});
}
