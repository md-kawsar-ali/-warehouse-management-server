const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

        // Get All Cars or Limited Cars
        app.get('/cars', async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            const query = {};
            const cursor = carsCollection.find(query);
            let cars;

            // If Page or Size exist. (else, response with all cars)
            if (page || size) {
                cars = await cursor.skip(page * size).limit(size).toArray();
            } else {
                cars = await cursor.toArray();
            }
            res.send(cars);
        });

        // Get Single Car
        app.get('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: ObjectId(id)
            }
            const result = await carsCollection.findOne(query);
            res.send(result);
        });

        // Delete Car
        app.delete('/car/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: ObjectId(id)
            }

            const result = await carsCollection.deleteOne(query);
            res.send(result);
        });

        // Update Quantity
        app.put('/car/:id', async (req, res) => {
            const id = req.params.id;
            const quantity = req.body.quantity;

            const filter = {
                _id: ObjectId(id)
            }

            const options = {
                upsert: true
            }

            const updateDoc = {
                $set: {
                    quantity: quantity
                }
            }

            const result = await carsCollection.updateOne(filter, updateDoc, options);

            res.send(result);
        });

        // Delete Car
        app.delete('/car/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: ObjectId(id)
            }

            const result = await carsCollection.deleteOne(query);
            res.send(result);
        });

        // Update Car Details
        app.put('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const { model, img, price, year, engine, body, transmission, color, doors, quantity, dealer } = req.body;
            const filter = {
                _id: ObjectId(id)
            }

            const options = {
                upsert: true
            }

            const updateDoc = {
                $set: {
                    model, img, price, year, engine, body, transmission, color, doors, quantity, dealer
                }
            }

            const result = await carsCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        // Add New Car
        app.post('/add', async (req, res) => {
            const car = req.body;

            const result = await carsCollection.insertOne(car);
            res.send(result);
        })

    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

// Port Listener
app.listen(port, () => {
    console.log('Server Running!');
});