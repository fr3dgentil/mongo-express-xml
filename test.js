const express = require('express');
const app = express();
const mongoXML = require('./index');

const mongoUri = '';

app.get('/', mongoXML(mongoUri));

app.listen(3000, function () {
	if(!mongoUri) console.log('Please provide a MongoDB URI in test.js');
  console.log('Example app listening on port 3000!');
})
