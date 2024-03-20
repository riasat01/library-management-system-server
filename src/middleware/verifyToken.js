const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
    const token = req?.cookies?.token;
    if (!token) {
        return res.status(401).send({ message: "Not Authorized" });
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
        if (error) {
            res.status(401).send({ message: "Unauthorized" });
        }
        req.verifiedUser = decoded;
        next();
    })
}

module.exports = { verifyToken };