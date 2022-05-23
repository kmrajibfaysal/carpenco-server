const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');

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
const userCollection = client.db('Carpenco').collection('users');

async function run() {
    await client.connect();
    console.log('database connected');

    app.get('/products', async (req, res) => {
        const products = await productCollection.find().toArray();
        res.send(products);
    });

    app.get('/products/:id', async (req, res) => {
        const { id } = req.params;
        const query = { _id: ObjectId(id) };
        const product = await productCollection.findOne(query);
        res.send(product);
    });

    app.get('/blogs', async (req, res) => {
        const blogs = await blogCollection.find().toArray();
        res.send(blogs);
    });

    // record user

    app.put('/user/:email', async (req, res) => {
        const { email } = req.params;
        const user = req.body;
        const filter = { email };
        const options = { upsert: true };
        const updateDoc = {
            $set: user,
        };

        const result = await userCollection.updateOne(filter, updateDoc, options);
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET);
        res.send({ result, token });
    });
}
run().catch(console.dir);

// Listener
app.listen(port, () => {
    console.log(`Doctors portal server running on port ${port}`);
});
