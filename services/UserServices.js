const mongo = require('mongodb')
const bcrypt = require('bcryptjs');

class UserServices {

  async getUsers() {
    const {client, db} = await this.getConnection();
    const collection = db.collection('hw4Users')

    const users =  await collection.find({}).project({'password': false}).toArray().catch((err) => {
      throw new Error(err)
    })
  
    client.close();
    return users
  }

  async getUser(username, password) {
    console.log('here user');
    
    const {client, db} = await this.getConnection();
    const collection = db.collection('hw4Users')

    console.log(username + " - " + password + " - ");
    
    
    const user =  await collection.findOne({'username': username})

    client.close()

    if (bcrypt.compareSync(password, user.password))
    {
      delete user.password
      return user;
    }  
    else
      return null;
  }

  async createUser(username, password) {
    const {client, db} = await this.getConnection();
    const collection = db.collection('hw4Users')

    var existUser = await collection.findOne({'username': username})

    if (existUser)
      throw new Error("Username has been taken")

    else {
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(password, salt);
      var newUser = {
        'username': username,
        'password': hash,
      }

      await collection.insertOne(newUser).catch((err) => {throw new Error(err)})

      client.close();
    }
  }



  async getConnection() {
    const MongoClient = require('mongodb').MongoClient;
    const url = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}?authSource=${process.env.DB_DATABASE}`
    const client = await MongoClient.connect(url, { useUnifiedTopology: true });
    const db = client.db(`${process.env.DB_DATABASE}`)

    return {client, db}
  }

}

module.exports = UserServices



