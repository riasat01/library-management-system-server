const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require("jsonwebtoken");
const CookieParser = require('cookie-parser');

// built in middleware
app.use(cors({
    origin: [
        'http://localhost:5173'
    ],
    credentials: true
}));
app.use(express.json());
app.use(CookieParser());

// custom middleware

const verifyToken = async (req, res, next) => {
    const token = req.cookies?.token;
    // console.log(`Value of token in middleware ${token}`);
    if (!token) {
        return res.status(401).send({ message: 'Not Authorized' });
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            // console.log(err);
            return res.status(401).send({ message: 'unauthorized' })
        }
        // console.log('Value in the token', decoded);
        req.verifiedUser = decoded;
        next();
    })
}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.1xv3maf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        const library = client.db("library").collection("books");
        const borrow = client.db("library").collection("borrow");

        // auth related api 
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            // console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res
                .cookie('token', token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none'
                })
                .send({ success: true });
        })

        app.post('/logout', async (req, res) => {
            const user = req.body;
            // console.log('logging out user', user);
            res.clearCookie('token', { maxAge: 0 }).send({ success: true })
        })

        // services related api endpoints
        app.get('/books', verifyToken, async (req, res) => {
            const query = req.query;
            const email = req.query.email;
            if (email !== req.verifiedUser.email) {
                return res.status(403).send({ message: 'forbidden access' });
            }
            if (query.category === 'All') {
                const result = await library.find().toArray();
                res.send(result);
            } else {
                const filter = { category: query.category };
                const result = await library.find(filter).toArray();
                res.send(result);
            }
        })
        app.post('/books', async (req, res) => {
            const book = req.body;
            // console.log(book);
            const result = await library.insertOne(book);
            res.send(result);
        })

        app.get('/book/:id', verifyToken, async (req, res) => {
            const email = req.query.email;
            if (email !== req?.verifiedUser?.email) {
                return res.status(403).send({ message: 'forbidden access' });
            }
            const _id = req.params.id;
            const filter = { _id: new ObjectId(_id) };
            const result = await library.findOne(filter);
            res.send(result);
        })

        app.put('/book/:id', async (req, res) => {
            const _id = req.params.id;
            const filter = { _id: new ObjectId(_id) };
            const quantity = req.body.quantity;
            // console.log(quantity);
            const updateDoc = {
                $set: {
                    quantity: quantity
                },
            };
            const result = await library.updateOne(filter, updateDoc);
            // console.log(result);
            res.send(result);
        })

        app.get('/borrow', verifyToken, async (req, res) => {
            const email = req.query.email;
            const name = req.query.name;
            if (email !== req?.verifiedUser?.email) {
                return res.status(403).send({ message: 'forbidden access' });
            }
            // const _id = req.params.id;
            const filter = { userEmail: email, name: name };
            const result = await borrow.find(filter).toArray();
            res.send(result);
        })

        app.post('/borrow', async (req, res) => {
            const info = req.body;
            // console.log(info);
            const result = await borrow.insertOne(info);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



// server root
app.get('/', (req, res) => {
    res.send('Server is running');
})

app.listen(port, () => {
    console.log('server created')
})