var MongoClient = require('mongodb').MongoClient;
var colors = require('colors');

module.exports = uri => col => action => args => new Promise(function(resolve, reject) {

	uri = uri.search(/mongodb:\/\//) === 0 ? uri : 'mongodb://' + uri;

	MongoClient.connect(uri, function(err, db) {
		if (err) {
			var errorMessage = 'The attempt to connect to the database failed.'+
			' Please check the URI.';
			console.log(errorMessage.red);
			console.log(uri);
			return reject(errorMessage);
		}

		if(action==='find'){

		db.collection(col)[action](...args)
			.map(x => {
				if (x._id) {
					x._id = x._id.valueOf().toString();
				}
				return x;
			}).toArray(function(err, docs) {
				if(err) reject('Unauthorized');
				resolve(docs);
			});
		}

		else{
			db.collection(col)[action](...args, function(err,r){
				if(err) reject(err);
				console.log(r);
				resolve({result: r.result});
			});
		}

		db.close();
	});
});
