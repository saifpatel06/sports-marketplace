const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'database.json');

// Initialize database file if not exists
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [] }, null, 2));
    console.log('Database file created successfully');
}

const loadDatabase = () => {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
};

const saveDatabase = (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

app.use(bodyParser.json());

// Register Route
app.post('/register', (req, res) => {
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
        
        const newUser = { id: Date.now(), name, email, password: hash };
        db.users.push(newUser);
        saveDatabase(db);
        res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
    });
});

// Login Route
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    let db = loadDatabase();
    const user = db.users.find(user => user.email === email);
    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
            res.status(200).json({ message: 'Login successful', userId: user.id });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
