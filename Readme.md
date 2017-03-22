# GLO-3112 - Développement avancé d'applications web - API


GLO-3112 - Développement avancé d'applications web - API - Livrable 2

The API is available at the following address :
http://sample-env.ttuhj5f6tu.us-east-1.elasticbeanstalk.com/

## Installing

```
npm install
node app.js
```

## Available APIs

### User APIs


#### GET `/users`

No argument.

Returns all users in the database.


#### GET `/users/:userId`

Returns information of one user.


#### POST `/users`

To create a new user.

The body must have :

* `id`: The id
* `password`: The password
* `email`: The email
* `firstName`: The first name
* `lastName`: The last name
* `phoneNumber`: The phone number


#### PUT `/users/:userId`

To update its information.

You can only update your profile.
Require authentication and following in header :

```json
{
  "Authorization": "Bearer " + "token"
}
```

The body must have :

* `email`: new email
* `firstName`: new first name
* `lastName`: new last name
* `phoneNumber`: new phone number


#### DELETE `/users/:userId`

To delete user.

You can only delete your profile.
Require authentication and following in header :

```json
{
  "Authorization": "Bearer " + "token jwt"
}
```

#### POST `/login`

To connect to the application.

The body must have :

* `id`: name
* `password`: password

It returns the following :

```json
{
  "token": "Bearer " + "token"
}
```

#### GET `/auth/facebook`

To connect to the application with a Facebook account.
If it is the first connection, an account is created with the user's information



### Picture APIs


#### GET `/pictures`

No argument.

Returns all pictures in the database.

#### GET `/pictures/:userId/pictures/`

Returns all pictures of one user.


#### GET `/pictures/:userId/pictures/:picturesId`

Returns information of one user's picture.


#### POST `/users/:userId/pictures`

To upload a picture.

Require authentication and following in header :

```json
{
  "Authorization": "Bearer " + "token"
}
```

The body must have :
* `file`: The picture

The body can have :

* `description`: The description
* `mentions`: The mentions
* `tags`: The tags


#### PUT `/pictures/:userId/pictures/:picturesId`

To update a picture.

You can only update your pictures.
Require authentication and following in header :

```json
{
  "Authorization": "Bearer " + "token"
}
```

The body must have :

* `description`: new description
* `mentions`: new mentions
* `tags`: new tags


#### DELETE `/pictures/:userId/pictures/:picturesId`

To delete a picture.

You can only delete your pictures.
Require authentication and following in header :

```json
{
  "Authorization": "Bearer " + "token jwt"
}
```

### Search APIs

#### GET `/search/users?data=userId`


#### GET `/search/users?data=description`


#### GET `/search/users?data=tags`
