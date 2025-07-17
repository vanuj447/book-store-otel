-- Drop old tables if they exist
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS books;

-- Create 'books' table
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(100),
    price NUMERIC(6, 2) NOT NULL,
    stock INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create 'users' table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create 'orders' table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    book_id INT NOT NULL,
    user_id INT NOT NULL,
    status VARCHAR(20) DEFAULT 'processing',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create 'payments' table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    book_id INT NOT NULL,
    quantity INT NOT NULL,
    total_price NUMERIC(8, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    paid_at TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- Insert books into 'books' table
INSERT INTO books (title, author, genre, price, stock) VALUES
('Clean Code', 'Robert C. Martin', 'Programming', 450.00, 50),
('The Pragmatic Programmer', 'Andy Hunt', 'Programming', 550.00, 40),
('Atomic Habits', 'James Clear', 'Self-help', 350.00, 60),
('Sapiens', 'Yuval Noah Harari', 'History', 499.00, 35),
('Zero to One', 'Peter Thiel', 'Startup', 300.00, 20),
('The Alchemist', 'Paulo Coelho', 'Fiction', 250.00, 45),
('Design Patterns', 'Erich Gamma', 'Programming', 600.00, 30),
('The Psychology of Money', 'Morgan Housel', 'Finance', 399.00, 70),
('Deep Work', 'Cal Newport', 'Productivity', 425.00, 55),
('Thinking Fast and Slow', 'Daniel Kahneman', 'Psychology', 480.00, 25),
('Rich Dad Poor Dad', 'Robert Kiyosaki', 'Finance', 350.00, 65),
('Rework', 'Jason Fried', 'Startup', 320.00, 20),
('Cracking the Coding Interview', 'Gayle Laakmann', 'Interview', 750.00, 40),
('Algorithms', 'Robert Sedgewick', 'Computer Science', 690.00, 18),
('The Mythical Man-Month', 'Fred Brooks', 'Software Engineering', 499.00, 28),
('Dune', 'Frank Herbert', 'Sci-Fi', 520.00, 22),
('Harry Potter', 'J.K. Rowling', 'Fantasy', 299.00, 80),
('Lord of the Rings', 'J.R.R. Tolkien', 'Fantasy', 699.00, 19),
('To Kill a Mockingbird', 'Harper Lee', 'Fiction', 400.00, 26),
('1984', 'George Orwell', 'Dystopian', 420.00, 33),
('The Lean Startup', 'Eric Ries', 'Startup', 370.00, 50),
('Start With Why', 'Simon Sinek', 'Leadership', 390.00, 47),
('The Subtle Art of Not Giving a F*ck', 'Mark Manson', 'Self-help', 360.00, 48),
('Ikigai', 'Francesc Miralles', 'Philosophy', 299.00, 40),
('Hooked', 'Nir Eyal', 'Product', 450.00, 23),
('Grokking Algorithms', 'Aditya Bhargava', 'Computer Science', 580.00, 37);

-- Generate 50 random payments (simulate real data)
INSERT INTO payments (book_id, quantity, total_price, status, paid_at)
SELECT 
    FLOOR(RANDOM() * 25 + 1)::INT AS book_id,
    FLOOR(RANDOM() * 3 + 1)::INT AS quantity,
    ROUND((price * (FLOOR(RANDOM() * 3 + 1)))::NUMERIC, 2) AS total_price,
    CASE 
        WHEN RANDOM() < 0.85 THEN 'COMPLETED'
        ELSE 'PENDING'
    END AS status,
    CASE 
        WHEN RANDOM() < 0.85 THEN NOW() - (FLOOR(RANDOM() * 30) || ' days')::INTERVAL
        ELSE NULL
    END AS paid_at
FROM books
ORDER BY RANDOM()
LIMIT 50;
