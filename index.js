const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// Mongodb config
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i1sr7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// Welcome
app.get('/', (req, res) => {
    res.send('Welcome to the Inventory Management Server!');
});

async function run() {
    try {
        await client.connect();
        const database = client.db("motodeal");
        const carsCollection = database.collection("cars");

        // Get All cars
        app.get('/cars', async (req, res) => {
            const query = {};
            const cursor = carsCollection.find(query);
            const result = await cursor.toArray();
            res.json(result);
        });

    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

// Port Listener
app.listen(port, () => {
    console.log('Server Running!');
});