const express = require("express");
const cors = require("cors");
const CookieParser = require("cookie-parser");

const app = express();

const applyDefaultMiddleWares = () => {
    app.use(cors({
        origin: [
            'http://localhost:5173',
            'https://papyrusportal-4ba83.web.app',
            'https://papyrusportal-4ba83.firebaseapp.com'
        ],
        credentials: true
    }));
    app.use(express.json());
    app.use(CookieParser());
}

module.exports = { applyDefaultMiddleWares };