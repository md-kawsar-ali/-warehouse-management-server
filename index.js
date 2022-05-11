const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
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

// Verify JWT
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'forbidden' });
        }
        req.decoded = decoded;
        next();
    });
}

// Welcome
app.get('/', (req, res) => {
    res.send('Welcome to the Inventory Management Server!');
});

async function run() {
    try {
        await client.connect();
        const database = client.db("motodeal");
        const carsCollection = database.collection("cars");

        // Authentication
        app.post('/login', async (req, res) => {
            const { uid } = req.body;
            const accessToken = jwt.sign({ uid }, process.env.ACCESS_TOKEN, { expiresIn: '1d' });
            res.send({ accessToken });
        });

        // Get All Cars or Limited Cars
        app.get('/cars', async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            const query = {};
            const cursor = carsCollection.find(query).sort({ '_id': -1 });
            let cars;

            // If Page or Size exist. (else, response with all cars)
            if (page || size) {
                cars = await cursor.skip(page * size).limit(size).toArray();
            } else {
                cars = await cursor.toArray();
            }
            res.send(cars);
        });

        // Get Cars Of Specific User
        app.get('/cars/user', verifyJWT, async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            const uid = req.query.uid;
            const query = {
                'uid': uid
            };
            const cursor = carsCollection.find(query).sort({ '_id': -1 });
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
        });

        // Add New Car
        app.post('/add', async (req, res) => {
            const car = req.body;

            const result = await carsCollection.insertOne(car);
            res.send(result);
        });

        // Total Car Count
        app.get('/carCount', async (req, res) => {
            const count = await carsCollection.countDocuments();
            res.send({ count });
        });

        // Total Car Count for Specific User
        app.get('/carCount/:uid', verifyJWT, async (req, res) => {
            const uid = req.params.uid;
            const count = await carsCollection.countDocuments({ 'uid': uid });
            res.send({ count });
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