let token = null;

// Load books
fetch('/books')
  .then(res => res.json())
  .then(books => {
    const list = document.getElementById('book-list');
    books.forEach(book => {
      const div = document.createElement('div');
      div.className = 'book';
      div.innerHTML = `<strong>${book.title}</strong> by ${book.author}<br>
      Genre: ${book.genre}<br>
      ₹${book.price} — Stock: ${book.stock}<br>
      <em>Book ID: ${book.id}</em>`;
      list.appendChild(div);
    });
  });

// Sign Up
document.getElementById('signup-form').addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  const res = await fetch('/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();
  document.getElementById('auth-response').textContent = data.message || data.error;
});

// Login
document.getElementById('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (data.token) {
    token = data.token;
    document.getElementById('auth-response').textContent = '✅ Logged in successfully!';
  } else {
    document.getElementById('auth-response').textContent = `❌ ${data.error}`;
  }
});

// Place Order
document.getElementById('order-form').addEventListener('submit', async e => {
  e.preventDefault();
  const book_id = document.getElementById('book-id').value;

  const res = await fetch('/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ book_id })
  });

  const data = await res.json();
  const response = data.error ? `❌ ${data.error}` : `✅ Order placed successfully! Order ID: ${data.id}`;
  document.getElementById('order-response').textContent = response;
});
