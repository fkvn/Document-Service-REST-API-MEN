const mongo = require('mongodb')
const bcrypt = require('bcryptjs');

class UserServices {

  async getUsers(db) {
    const userCollection = db.collection('hw4Users')
    
    const users =  await  userCollection.find({}).project({'password': false}).toArray().catch((err) => {
      throw new Error(err)
    })
    return users
  }

  async getUser(db, username, password) {

    const userCollection = db.collection('hw4Users')

    console.log(username + " - " + password + " - ");
    
    
    const user =  await userCollection.findOne({'username': username})


    if (bcrypt.compareSync(password, user.password))
    {
      delete user.password
      return user;
    }  
    else
      return null;
  }

  async createUser(db, username, password) {
    const userCollection = db.collection('hw4Users')

    var existUser = await userCollection.findOne({'username': username})

    if (existUser)
      throw new Error("Username has been taken")

    else {
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(password, salt);
      var newUser = {
        'username': username,
        'password': hash,
      }

      await userCollection.insertOne(newUser).catch((err) => {throw new Error(err)})
    }
  }
}

module.exports = UserServices



