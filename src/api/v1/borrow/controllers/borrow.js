const getAllBorrowedBooks = async (req, res, borrow) => {
    const email = req.query?.email;
    if (email !== req.verifiedUser?.email) {
        return res.status(403).send({ message: "forbidden access" });
    }
    const filter = { userEmail: email };
    const result = await borrow?.find(filter).toArray();
    res.send(result);
}


const getABorrowedBook = async (req, res, borrow) => {
    const { email, name } = req.query;
    if (email !== req?.verifiedUser?.email) {
        return res.status(403).send({ message: 'forbidden access' });
    }
    const filter = { userEmail: email, name: name };
    const result = await borrow.find(filter).toArray();
    res.send(result);
}

const borrowABook = async (req, res, borrow) => {
    const info = req.body;
    const result = await borrow.insertOne(info);
    res.send(result);
}

const returnABook = async (req, res, borrow) => {
    const { name, email } = req.query;
    const filter = { userEmail: email, name: name };
    const result = await borrow.deleteOne(filter)
    res.send(result);
}

module.exports = { getAllBorrowedBooks, getABorrowedBook, borrowABook, returnABook };