require('dotenv').config()
const express = require('express');
const helmet = require("helmet");
const cors = require('cors');
const Joi = require('joi');
const jwt = require('jsonwebtoken');

const app = express();
const SECRET_KEY = process.env.SECET_KEY

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors({
    origin: 'http://your-frontend-domain.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Sample Users Database (Simulating User Authentication)
const users = [
    { id: 1, name: "Alice", email: "alice@example.com", role: "user" },
    { id: 2, name: "Bob", email: "bob@example.com", role: "admin" }
];

// Joi Schema for User Input Validation
const userSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
});

// Middleware for JWT Authentication
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

    jwt.verify(token.split(" ")[1], SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
};

// Middleware for Role-Based Access Control (RBAC)
const authorizeRole = (role) => (req, res, next) => {
    if (req.user.role !== role) {
        return res.status(403).json({ error: "Forbidden: You don't have access to this resource." });
    }
    next();
};

// Home Route
app.get("/", (req, res) => {
    res.send("Hello from Secure Web Server");
});

// User Registration Route (Public)
app.post("/user", (req, res) => {
    const { error } = userSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    res.json({ message: "User data is valid!", data: req.body });
});

// Login Route - Issues JWT Token
app.post("/login", (req, res) => {
    const { email } = req.body;
    const user = users.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    // Generate JWT Token
    const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, SECRET_KEY, { expiresIn: "1h" });

    res.json({ message: "Login successful", token });
});

// Protected Route - Requires Authentication
app.get("/profile", authenticateToken, (req, res) => {
    res.json({ message: "User profile accessed", user: req.user });
});

// Admin-only Route (RBAC)
app.get("/admin", authenticateToken, authorizeRole("admin"), (req, res) => {
    res.json({ message: "Welcome, Admin!", user: req.user });
});

// Start Server
const port = 3000;
app.listen(port, () => console.log(`Server is running at port: ${port}`));