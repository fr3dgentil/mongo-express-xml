var obj2xml = require('object-to-xml');
var R = require('ramda');
var Either = require('minimal-either-monad-with-errors-handling');
var mongoRequest = require('./mongoRequest');
var plur = require('pluralize');
plur.addPluralRule('a', '');

module.exports = defaultUri => function(req, res) {
	res.set('Content-Type', 'text/xml');

	// -------------------------
	// createXml
	// -------------------------
	var createXml = obj => obj2xml({
		'?xml version=\"1.0\" encoding=\"UTF-8\"?': null,
		request: {
			[typeof obj === 'object' ? 'document' : 'error']: obj
		}
	});
	// -------------------------
	// CheckPresence
	// -------------------------
	var checkPresence = fields => query => {
		var missing = [];
		for (var field of fields) {
			if (typeof query[field] !== 'string') {
				missing.push(field);
			}
		}
		var l = missing.length;
		if (!l) return query;
		else throw `The ${plur('field',l)} ${missing.join(' & ')}` +
			`${plr('is',l)} missing.`;
	};
	// -------------------------
	// CheckAction
	// -------------------------
	var checkAction = query => {
		var actions = ['find', 'insertOne', 'insertMany', 'updateOne',
			'updateMany', 'deleteOne', 'deleteOne'
		];
		if (R.contains(query.action, actions)) return query;
		else throw `The action <${query.action}> is not available.` +
			`(Availables: ${actions})`;
	};
	//------------------------
	// parseJsonArgs
	//------------------------
	function parseJsonArgs(query) {
		try {
			query = R.clone(query);
			query.args = JSON.parse(query.args);
			if (!(query.args instanceof Array)) query.args = [query.args];
			return query;
		} catch (e) {
			throw 'The value of the field <args> is not valid JSON. '+ query.args;
		}
	}
	//------------------------
	// chooseUri
	//------------------------
	var chooseUri = defaultUri => query => {
		if (query.uri) return query;
		else if (defaultUri) {
			query = R.clone(query);
			query.uri = defaultUri;
			return query;
		} else throw ('There is no URI');
	}
	//------------------------
	// removeUriQuotes
	//------------------------
	var removeUriQuotes = query => {
		var doubleQuotes = /^".*"$/,
			singleQuotes = /^'.*'$/;
		if (query.uri.search(doubleQuotes) === 0 ||
			query.uri.search(singleQuotes) === 0) {
			var withoutQuotes = /[^'"].*[^'"]/;
			query.uri = query.uri.match(withoutQuotes)[0];
		}
		return query;
	}
	//------------------------
	// uriSyntaxValidation
	//------------------------
	var uriSyntaxValidation = query => {
		var wLog = /^(mongodb:\/\/)?[A-Za-z\d-_.]*:[A-Za-z\d-_.]*@[A-Za-z\d-_.]*\/[A-Za-z\d-_.]*/;
		var wtLog = /^(mongodb:\/\/)?[A-Za-z\d-_.]*\/[A-Za-z\d-_.]*/;
		if (query.uri.search(wLog) === 0 || 
			query.uri.search(wtLog) === 0) return query;
		else throw 'The URI is not valid.';
	}
	//------------------------
	// dbResquest & sendXML
	//------------------------
	var dbRequest = then => query => {
		return mongoRequest(query.uri)(query.col)(query.action)(query.args)
			.then(then, then);
	}
	var sendXML = R.compose(res.send.bind(res), createXml);

	//------------------------
	Either.fromNullable(req.query)
		.map(parseJsonArgs)
		.map(chooseUri(defaultUri))
		.map(removeUriQuotes)
		.map(uriSyntaxValidation)
		.map(checkPresence(['col', 'action']))
		.map(checkAction)
		.map(dbRequest(sendXML))
		.orElse(sendXML)
}
