const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'database.json');

// Initialize database file if it doesn't exist
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], products: [], orders: [], cart: [] }, null, 2));
    console.log('Database file created successfully');
}

const loadDatabase = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const saveDatabase = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' directory

// Register Route
app.post('/api/register', (req, res) => {
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
        res.status(201).json({ message: 'User registered successfully', data: newUser.id });
    });
});

// Login Route
app.post('/api/login', (req, res) => {
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
            res.status(200).json({ message: 'Login successful', data: user.id });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    });
});

// Get All Products (with optional filtering by category)
app.get("/api/products", (req, res) => {
    const db = loadDatabase();
    const { category } = req.query; // Get category from query params

    if (category) {
        const filteredProducts = db.products.filter(product => 
            product.category && product.category.toLowerCase() === category.toLowerCase()
        );

        return res.status(200).json(filteredProducts);
    }

    res.status(200).json(db.products); // Return all products if no category is specified
});


// Get a Single Product by ID
app.get("/api/products/:id", (req, res) => {
    const db = loadDatabase();

    const product = db.products.find(product => product.id === req.params.id);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
});

// Add to Cart
app.post("/api/cart", (req, res) => {
    const { userId, productId, quantity, size } = req.body;

    if (!userId || !productId || !quantity || !size) {
        return res.status(400).json({ message: 'userId, productId, quantity and size are required' });
    }

    const db = loadDatabase();
    
    // Check if user exists
    const user = db.users.find(user => user.id === Number(userId));
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Check if product exists
    const product = db.products.find(product => product.id === productId);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    // Initialize cart array if it doesn't exist
    if (!db.cart) {
        db.cart = [];
    }

    // Check if item already exists in cart
    const existingCartItem = db.cart.find(item => item.userId === userId && item.productId === productId);
    
    if (existingCartItem) {
        existingCartItem.quantity += quantity;
    } else {
        const cartItem = { id: uuid.v4(), userId, productId, quantity, size };
        db.cart.push(cartItem);
    }

    saveDatabase(db);
    res.status(201).json({ message: 'Item added to cart successfully' });
});

// Remove from Cart
app.delete("/api/cart/:cartItemId", (req, res) => {
    const { cartItemId } = req.params;
    const { userId } = req.body;

    if (!userId || !cartItemId) {
        return res.status(400).json({ message: 'userId and cartItemId are required' });
    }

    const db = loadDatabase();
    
    // Check if cart item exists and belongs to user
    const cartItemIndex = db.cart.findIndex(item => item.id === cartItemId && item.userId === userId);
    
    if (cartItemIndex === -1) {
        return res.status(404).json({ message: 'Cart item not found' });
    }

    // Remove item from cart
    db.cart.splice(cartItemIndex, 1);
    saveDatabase(db);

    res.status(200).json({ message: 'Item removed from cart successfully' });
});

// Get Cart Items by User ID
app.get("/api/cart", (req, res) => {
    const userId = req.query.userId;
    
    if (!userId) {
        return res.status(400).json({ message: 'userId query param is required' });
    }

    const db = loadDatabase();
    
    // Initialize empty cart if it doesn't exist
    if (!db.cart) {
        db.cart = [];
    }

    // Get cart items for user
    const cartItems = db.cart.filter(item => item.userId === userId);

    // Get full product details for each cart item
    const cartItemsWithDetails = cartItems.map(item => {
        const product = db.products.find(p => p.id === item.productId);
        return {
            ...item,
            product
        };
    });

    res.status(200).json(cartItemsWithDetails);
});


// Create an Order
app.post("/api/orders", (req, res) => {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || !quantity) {
        return res.status(400).json({ message: 'userId, productId, and quantity are required' });
    }

    const db = loadDatabase();
    const user = db.users.find(user => user.id === userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const product = db.products.find(product => product.id === productId);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    const order = { id: uuid.v4(), userId, productId, quantity, status: 'pending' };
    if (!db.orders) {
        db.orders = [];
    }

    db.orders.push(order);
    saveDatabase(db);

    res.status(201).json({ message: 'Order created successfully', data: order.id });
});

// Get Orders by User ID
app.get("/api/orders", (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).json({ message: 'userId query param is required' });
    }

    const db = loadDatabase();
    const orders = db.orders.filter(order => order.userId === userId);

    res.status(200).json(orders);
});

// Serve `index.html` for all unknown routes (SPA Fallback)
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
