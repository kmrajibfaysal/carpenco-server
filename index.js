/* eslint-disable no-unused-vars */
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
const orderCollection = client.db('Carpenco').collection('orders');
const reviewCollection = client.db('Carpenco').collection('reviews');
const newProductCollection = client.db('Carpenco').collection('newProducts');
const paymentCollection = client.db('Carpenco').collection('payments');

async function run() {
    try {
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

        // stripe
        app.post('/create-payment-intent', async (req, res) => {
            const service = req.body;
            const amount = 10000;
            const paymentIntent = await stripe.paymentIntents.create({
                amount,
                currency: 'usd',
                payment_method_types: ['card'],
            });
            res.send({ clientSecret: paymentIntent.client_secret });
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

        app.post('/order', async (req, res) => {
            const data = req.body;
            const result = await orderCollection.insertOne(data);
            res.send(result);
        });
        app.get('/orders', async (req, res) => {
            const result = await orderCollection.find().toArray();
            res.send(result);
        });

        app.patch('/order/:id', async (req, res) => {
            const { id } = req.params;
            const payment = req.body;
            const filter = { _id: ObjectId(id) };
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId,
                },
            };

            const result = await paymentCollection.insertOne(payment);
            const updatedBooking = await orderCollection.updateOne(filter, updatedDoc);
            res.send(updatedBooking);
        });

        app.get('/order', async (req, res) => {
            const { email } = req.query;
            const query = { user: email };
            const options = {};

            const orders = await orderCollection.find(query, options).toArray();

            res.send(orders);
        });

        app.get('/order/:id', async (req, res) => {
            const { id } = req.params;
            const query = { _id: ObjectId(id) };
            const order = await orderCollection.findOne(query);
            res.send(order);
        });

        app.delete('/order/:id', async (req, res) => {
            const { id } = req.params;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        });
        app.delete('/product/:id', async (req, res) => {
            const { id } = req.params;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        });

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        });

        app.get('/reviews', async (req, res) => {
            const reviews = await reviewCollection.find().toArray();

            res.send(reviews);
        });

        app.post('/users', async (req, res) => {
            const newUser = req.body;

            const filter = { email: newUser.email };
            const options = { upsert: true };
            const updateDoc = {
                $set: newUser,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        app.get('/users/:email', async (req, res) => {
            const { email } = req.params;
            const query = { email };
            const result = await userCollection.findOne(query);
            res.send(result);
        });
        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        });
        app.get('/newProducts', async (req, res) => {
            const result = await productCollection.find().toArray();
            res.send(result);
        });

        app.post('/newProduct', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send(result);
        });
    } finally {
        //
    }
}
run().catch(console.dir);

// Listener
app.listen(port, () => {
    console.log(`Carpenco server running on port ${port}`);
});
