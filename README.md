# moncket
Moncket is a DaaS developed with MongoDB and Socket.io. Aims to facilitate the implementation of mongodb-based applications by enabling full control of the database through the client side.

## Get started

````
npm install moncket
````
or
````
yarn add moncket
````
and then
````
import moncket from "moncket";
````
## Initialize

````
moncket.initializeApp({
   projectId: "my-project",
   apiKey: "8dExDbsT64LcKgGH4PGsF7H76ywqrmVT",
   databaseURL: "http://localhost:3000"
});
````

## Global callbacks
Create a database connection and perform the last callback.
````
moncket.connect(_callback);
````

Removes a connection to the database and performs the last callback.
````
moncket.disconnect(_callback);
````

Record a callback to be executed whenever a connection is established.
````
moncket.onConnect(_callback);
````

Record a callback to be performed whenever a connection is removed.
````
moncket.onDisconnect(_callback);
`````

## Auth
Users must be registered in a collection called users. Must have unique email and password encrypted in MD5.
````
moncket.auth().signIn(email, password);
````

To perform password recovery, the library sends an email with a random 6-digit code.
````
moncket.auth().sendPasswordResetEmail(email);
````
After sending the email, the code will be verified in the user's collection. If it is correct the password will be changed.
````
moncket.auth().resetPassword(verificationCode, email, password);
````

## Database
The database methods allow direct manipulation of all database collections and some additional methods such as watchers and paginators.

### Collection
Most MongoDB Collection Methods are accepted. You can check which methods are available by [clicking here](https://docs.mongodb.com/manual/reference/method/js-collection/).

#### .exec()
Runs the command on the server and returns the resulting query object.

````
let e = await moncket.db().collection("users").find().toArray().exec();
````

#### .stack()
Returns the stack assembled by the sentence. Do not execute any commands on the server.

````
let e = await moncket.db().collection("users").find().toArray().stack();
````

#### Other examples

````
let e = await moncket.db().collection("users").find().toArray().exec();
````
````
let e = await moncket.db().collection("users").aggregate([
	{match: {name: "John Snow"}}
]).toArray().exec();
````
````
let e = await moncket.db().collection("users").findOne({name: "John Snow"}).exec();
````
````
let e = await moncket.db().collection("users").distinct("email").exec();
````
````
let e = await moncket.db().collection("users").countDocuments().exec();
````

### Paginate
````
let e = await moncket.db().paginate({
     collection: "users",
     pipeline: [
         {
             $match: {
                 name: "John Snow"
             }
         }
     ],
     skip: 10,
     limit: 20,
     sort: { name: -1 }
 });
````

### Transaction
Executes multiple commands on the server in a single request. All sentences within a transaction must be written with .stack () at the end.
````
let e = moncket.db().transaction({
	products: moncket.db().collection("products").find().toArray().stack(),
	groups: moncket.db().collection("groups").find().toArray().stack()
});

e.products //array of products
e.groups //array of groups
````

### Watch
The watch method enables easy creation of changeStreams, establishing real-time communication with all changes made to the database.

#### Create a listener
````
this.watcher = moncket.db().watch({
    collection: "users",
    pipeline: [
        {
            $match: { name: "John Snow" }
        }
    ],
    success: (users) => console.log(users),
    error: (error) => console.debug(error)
});
````

#### Remove a listener
````
this.watcher.removeListener();
````
