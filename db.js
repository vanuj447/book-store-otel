const { Pool } = require('pg');
const logger = require('./logger');

// Create PostgreSQL connection pool
const pool = new Pool({
  user: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'bookstore',
  password: 'password',
  port: 5432
});

// 1. Get all books
async function getBooks() {
  const result = await pool.query('SELECT * FROM books');
  return result.rows;
}

// 2. Place an order
async function placeOrder(book_id, user_id) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check stock
    const stockCheck = await client.query(
      'SELECT stock FROM books WHERE id = $1 FOR UPDATE',
      [book_id]
    );

    if (stockCheck.rows.length === 0) {
      throw new Error('Book not found');
    }

    const stock = stockCheck.rows[0].stock;
    if (stock < 1) {
      throw new Error('Book out of stock');
    }

    // Create order
    const orderResult = await client.query(
      'INSERT INTO orders (book_id, user_id, status) VALUES ($1, $2, $3) RETURNING *',
      [book_id, user_id, 'processing']
    );

    const order = orderResult.rows[0];

    // Reduce stock
    await client.query(
      'UPDATE books SET stock = stock - 1 WHERE id = $1',
      [book_id]
    );

    await client.query('COMMIT');
    return order;

  } catch (err) {
    await client.query('ROLLBACK');
    logger.error(`DB error during order: ${err.message}`);
    throw err;
  } finally {
    client.release();
  }
}

// 3. Get order by ID
async function getOrderById(order_id) {
  const result = await pool.query(
    'SELECT * FROM orders WHERE id = $1',
    [order_id]
  );
  return result.rows[0];
}

// 4. Create a new user
async function createUser(name, email, hashedPassword) {
  const result = await pool.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
    [name, email, hashedPassword]
  );
  return result.rows[0];
}

// 5. Get user by email
async function getUserByEmail(email) {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
}

module.exports = {
  getBooks,
  placeOrder,
  getOrderById,
  createUser,
  getUserByEmail
};
