const createTables = (client) => {
    const library = client.db("library").collection("books");
    const borrow = client.db("library").collection("borrow");
    const utility = client.db("library").collection("utility");
    return [library, borrow, utility];
}

module.exports = { createTables };