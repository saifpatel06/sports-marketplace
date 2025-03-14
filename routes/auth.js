const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const { loadDatabase, saveDatabase } = require('../utils/db');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

// Register Route
router.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    let db = loadDatabase();
    if (db.users.some(user => user.email === email)) {
        return res.status(400).json({ message: 'User already exists' });
    }

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({ message: 'Error hashing password' });

        const newUser = { id: uuid.v4(), name, email, password: hash };
        db.users.push(newUser);
        saveDatabase(db);

        // Create token
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        });
    });
});

// Login Route
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    let db = loadDatabase();
    const user = db.users.find(user => user.email === email);
    if (!user) {
        return res.status(401).json({ message: 'User not found' });
    }

    bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
            // Create token
            const token = jwt.sign(
                { id: user.id, email: user.email },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(200).json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    });
});

// Verify Token Route
router.get('/verify', verifyToken, (req, res) => {
    let db = loadDatabase();
    const user = db.users.find(user => user.id === req.user.id);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
        valid: true,
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    });
});

module.exports = router; 