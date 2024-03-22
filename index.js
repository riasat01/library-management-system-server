const express = require("express");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();
const { ObjectId } = require('mongodb');
const jwt = require("jsonwebtoken");
const { setUpDb } = require("./src/utils/setUpDb");
const { createTables } = require("./src/utils/createTables");
const { bannerData } = require("./src/api/v1/banner/controllers/banner");
const { getCategory } = require("./src/api/v1/category/controllers/category");
const { applyDefaultMiddleWares } = require("./src/middleware/applyDefaultMiddleWares");
const { verifyToken } = require("./src/middleware/verifyToken");
const { getBooks, postABook, updateBookInfo, increaseBookAfterReturn, getABook, decreaseBookAfterBorrow } = require("./src/api/v1/books/controllers/books");
const { getAllBorrowedBooks, getABorrowedBook, borrowABook, returnABook } = require("./src/api/v1/borrow/controllers/borrow");

// built in middleware
applyDefaultMiddleWares();


const client = setUpDb();


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();


        const [library, borrow, utility] = createTables(client);

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
        // app.get('/librarian', verifyToken, async (req, res) => {
        //     const email = req.query.email;
        //     if (email === req.verifiedUser.email && email === 'librarian@admin.mail') {
        //         res.send({admin: true});
        //     }
        //     res.send({admin: false});
        // })



        // services related api endpoints
        // banner data
        app.get('/banner', async (req, res) => bannerData(req, res, utility));

        app.get('/category', async (req, res) => getCategory(req, res, utility));

        app.get('/books', verifyToken, async (req, res) => getBooks(req, res, library));
        app.post('/books', async (req, res) => postABook(req, res, library));

        // update book info
        app.put('/update/:id', async (req, res) => updateBookInfo(req, res, library));

        // add book after return
        app.put('/books', async (req, res) => increaseBookAfterReturn(req, res, library));

        app.get('/book/:id', verifyToken, async (req, res) => getABook(req, res, library));

        // reduce book after borrow
        app.put('/book/:id', async (req, res) => decreaseBookAfterBorrow(req, res, library));

        app.get('/borrows', verifyToken, async (req, res) => getAllBorrowedBooks(req, res, borrow));

        app.get('/borrow', verifyToken, async (req, res) => getABorrowedBook(req, res, borrow));

        app.post('/borrow', async (req, res) => borrowABook(req, res, borrow));

        app.delete('/borrow', async (req, res) => returnABook(req, res, borrow));


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