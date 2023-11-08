const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// built in middleware
app.use(cors());
app.use(express.json());



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

        // services related api endpoints
        app.get('/books', async (req, res) => {
            const query = req.query;
            if(query.category === 'All'){
                const result = await library.find().toArray();
                res.send(result);
            }else{
                const filter = { category: query.category };
                const result = await library.find(filter).toArray();
                res.send(result);
            }
        })
        app.post('/books', async (req, res) => {
            const book = req.body;
            const result = await library.insertOne(book);
        })

        app.get('/book/:id', async (req, res) => {
            const _id = req.params.id;
            const filter = { _id: new ObjectId(_id)};
            const result = await library.findOne(filter);
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