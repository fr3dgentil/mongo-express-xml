# mongo-express-xml

This package provides a way to interact with a MongoDB database through http requests (for instance a browser). The responses of the requests are provided in XML. The [express framework](https://www.npmjs.com/package/express) is required.

## Usage Exemple

```
const app = require('express')();
const mongoXml = require('mongo-express-xml');

app.get('/', mongoXml('mongodb://uri'));

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
})
```

You only need to remplace `mongodb://uri` by a valid [MongoDB URI](https://docs.mongodb.com/manual/reference/connection-string/). The `mongodb://` is optional. Exemple: `Bob:pwd@localhost/test?authSource=admin`

## Test the app

`npm test` than open the browser to `http://localhost:3000`.

## Query fields to include to interact with MongoDB

Now, to interact with your database, you need to add the following [query string](https://www.wikiwand.com/en/Query_string) fields to the URL:

### col (required)
The MongoDB collection to use. Exemple: `col=test`

### action (required)
The following actions are available. : *find, insertOne, insertMany, updateOne, updateMany, deleteOne, deleteOne*. Exemple: `action=find`

### args

Those are the same arguments that you provides with normal MongoDB requests. If you are not sure, I recommand you [this documentation](http://mongodb.github.io/node-mongodb-native/2.2/tutorials/crud/
). The value of this field need to be a valid JSON object. If you need multiple arguments, put them between square brackets `[]`.

Exemple for an action of type *find*: `args=[{},{"_id":0}]`
Exemple for an action of type *updateOne*: `args=[{"name":"Bob"},{"$set":{"adress":"somewhere"}}]`

### uri
You can provide a [MongoDB URI](https://docs.mongodb.com/manual/reference/connection-string/) here to override the one provided on the server but it's not secure. The `mongodb://` is optional. Exemple: `uri="bob:pwd@hehe.com/test?authSource=admin"`

## Example:

`http://localhost?col=people&action=find&args=[{"name":"Bob"},{"_id":1}]`
