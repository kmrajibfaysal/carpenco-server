const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
// Get requests
app.get('/', (req, res) => {
    res.send(`Doctors portal server running on port ${port}`);
});

// Mongodb

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fakac.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

const productCollection = client.db('Carpenco').collection('products');
const blogCollection = client.db('Carpenco').collection('blogs');

async function run() {
    await client.connect();
    console.log('database connected');

    app.get('/products', async (req, res) => {
        const products = await productCollection.find().toArray();
        res.send(products);
    });
    app.get('/blogs', async (req, res) => {
        const blogs = await blogCollection.find().toArray();
        res.send(blogs);
    });
}
run().catch(console.dir);

// Listener
app.listen(port, () => {
    console.log(`Doctors portal server running on port ${port}`);
});
