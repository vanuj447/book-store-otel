require('./tracing');
const express = require('express');
const path = require('path');
const logger = require('./logger');
const db = require('./db');
const payment = require('./payment');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  totalOrders,
  paymentFailures,
  outOfStockCounter,
  orderDuration
} = require('./metrics');

const SECRET = 'your_secret_key'; // In production, use env vars

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Middleware for authentication
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token provided' });

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, SECRET);
    req.user_id = decoded.user_id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ✅ Health check
app.get('/health', (req, res) => {
  logger.info('Health check OK');
  res.status(200).send('Healthy');
});

// ✅ Get all books
app.get('/books', async (req, res) => {
  try {
    const books = await db.getBooks();
    logger.info(`Fetched ${books.length} books`);
    res.status(200).json(books);
  } catch (err) {
    logger.error(`Error fetching books: ${err.message}`);
    res.status(500).send('Internal Server Error');
  }
});

// ✅ User signup
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.createUser(name, email, hashedPassword);
    res.status(201).json({ message: 'User created', user });
  } catch (err) {
    logger.error(`Signup error: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
});

// ✅ User login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.getUserByEmail(email);
    if (!user) throw new Error('User not found');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error('Incorrect password');

    const token = jwt.sign({ user_id: user.id }, SECRET, { expiresIn: '2h' });
    res.json({ token });
  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    res.status(401).json({ error: err.message });
  }
});

// ✅ Place a new order (authenticated)
app.post('/orders', authenticate, async (req, res) => {
  const { book_id } = req.body;
  const user_id = req.user_id;

  if (!book_id) {
    return res.status(400).json({ error: 'book_id is required' });
  }

  const startTime = Date.now();

  try {
    const order = await db.placeOrder(book_id, user_id);

    await payment.processPayment(order.id); // Simulated

    const duration = (Date.now() - startTime) / 1000;
    orderDuration.record(duration);
    totalOrders.add(1);

    logger.info(`Order ${order.id} completed in ${duration}s`);
    res.status(201).json(order);
  } catch (err) {
    paymentFailures.add(1);
    logger.error(`Order failed: ${err.message}`);
    if (err.message.toLowerCase().includes('out of stock')) {
      outOfStockCounter.add(1);
    }
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get order by ID
app.get('/orders/:id', async (req, res) => {
  try {
    const order = await db.getOrderById(req.params.id);
    if (!order) {
      logger.warn(`Order ${req.params.id} not found`);
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (err) {
    logger.error(`Error fetching order: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`📦 Bookstore app running on port ${PORT}`);
});
