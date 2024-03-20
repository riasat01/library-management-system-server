const { ObjectId } = require("mongodb");

const getBooks = async (req, res, library) => {
    const category = req.query?.category;
    const email = req.query?.email;
    if (email !== req.verifiedUser?.email) {
        return res.status(403).send({ message: "Forbidden Access" });
    }
    if (category === "All") {
        const result = await library?.find().toArray();
        res.send(result);
    } else {
        const filter = { category: category };
        const result = await library?.find(filter).toArray();
        res.send(result);
    }
}
const getABook = async (req, res, library) => {
    const email = req.query.email;
    if (email !== req?.verifiedUser?.email) {
        return res.status(403).send({ message: 'forbidden access' });
    }
    const _id = req.params.id;
    const filter = { _id: new ObjectId(_id) };
    const result = await library.findOne(filter);
    res.send(result);
}

const postABook = async (req, res, library) => {
    const book = req.body;
    const result = await library?.insertOne(book);
    res.send(result);
}

const updateBookInfo = async (req, res, library) => {
    const id = req.params?.id;
    const updateBook = req.body;
    const { image_url, name, quantity, author, category, description, rating } = updateBook;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
        $set: {
            image_url,
            name,
            quantity,
            author,
            category,
            description,
            rating
        }
    }
    const result = await library.updateOne(filter, updateDoc);
    res.send(result);
}

const increaseBookAfterReturn = async (req, res, library) => {
    const { name, category, author } = req.query;
    const filter = { name, category, author };
    const requiredBook = await library?.findOne(filter);
    const quantity = parseInt(requiredBook?.quantity) + 1;
    const updateDoc = {
        $set: {
            quantity
        }
    }
    const result = await library?.updateOne(filter, updateDoc);
    res.send(result);
}

const decreaseBookAfterBorrow = async (req, res, library) => {
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
}

module.exports = { getBooks, getABook, postABook, updateBookInfo, increaseBookAfterReturn, decreaseBookAfterBorrow };