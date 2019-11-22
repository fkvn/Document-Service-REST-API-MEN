module.exports = {
  async getClient() {
    const MongoClient = require('mongodb').MongoClient;
    const url = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}?authSource=${process.env.DB_DATABASE}`
    const client  = await MongoClient.connect(url, { useUnifiedTopology: true });
    const db = client.db(`${process.env.DB_DATABASE}`)
    return {client, db}
  },
}