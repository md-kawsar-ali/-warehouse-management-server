const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// Get API
app.get('/', (req, res) => {
    res.send('Inventory Management Server Running!');
});

app.get('/user', (req, res) => {
    const user = {
        name: 'md kawsar ali',
        age: 22,
        gender: 'male'
    }
    res.send(user);
});

// Port Listener
app.listen(port, () => {
    console.log('Server Running!');
});