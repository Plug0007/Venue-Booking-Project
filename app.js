// app.js
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');

const app = express();

// Set EJS as the view engine and configure layouts
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout'); // Default layout for all pages
app.use(expressLayouts);

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: 'your_secret_key', // change this to a secure random string
  resave: false,
  saveUninitialized: true,
}));

// MySQL connection using mysql2
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Raelyaan', // Replace with your MySQL password
  database: 'venue_booking'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database.');
});

// ----- ROUTES -----

// Intro/Welcome page
app.get('/', (req, res) => {
  if (req.session.username) {
    // If logged in, redirect based on role
    if (req.session.isAdmin) {
      return res.redirect('/admin/bookings');
    } else {
      return res.redirect('/bookForm');
    }
  }
  res.render('intro', { title: 'Welcome to Venue Booking' });
});

// Booking form page for new bookings (only for logged-in users)
app.get('/bookForm', (req, res) => {
  if (!req.session.username) {
    return res.redirect('/login');
  }
  res.render('bookForm', { title: 'Book a Venue', username: req.session.username, isAdmin: req.session.isAdmin });
});

// Process new booking – override submitted name with session username
app.post('/book', (req, res) => {
  const { venue, bookingDate, bookingTime } = req.body;
  const name = req.session.username;  // Link booking to the logged-in user
  const sql = "INSERT INTO bookings (venue_id, booking_date, name, booking_time) VALUES (?, ?, ?, ?)";
  connection.query(sql, [venue, bookingDate, name, bookingTime], (err, result) => {
    if (err) {
      console.error('Error inserting booking:', err);
      // Log the complete error message for debugging
      return res.status(500).json({ success: false, message: err.message });
    }
    res.redirect('/user/bookings');
  });
});

// ----- LOGIN / LOGOUT -----

app.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

// Process login: admin credentials: admin/adminpass; regular users: any username/password
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'adminpass') {
    req.session.isAdmin = true;
    req.session.username = 'admin';
    res.redirect('/admin/bookings');
  } else {
    req.session.isAdmin = false;
    req.session.username = username;
    res.redirect('/bookForm'); // Regular users go to the booking form
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// ----- ADMIN ROUTES -----

// Admin view: list all bookings
app.get('/admin/bookings', (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(403).send('Access denied. Admins only.');
  }
  connection.query('SELECT * FROM bookings', (err, results) => {
    if (err) {
      console.error('Error retrieving bookings:', err);
      return res.status(500).send('Error retrieving bookings.');
    }
    res.render('adminBookings', { title: 'Admin - All Bookings', bookings: results, username: req.session.username, isAdmin: true });
  });
});

// Admin edit: GET form for editing a booking
app.get('/admin/bookings/:id/edit', (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(403).send('Access denied. Admins only.');
  }
  const bookingId = req.params.id;
  connection.query('SELECT * FROM bookings WHERE id = ?', [bookingId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).send('Booking not found.');
    }
    res.render('editBooking', { 
      title: 'Admin - Edit Booking', 
      booking: results[0], 
      action: `/admin/bookings/${bookingId}/edit`,
      isAdmin: true,
      backLink: '/admin/bookings',
      username: req.session.username
    });
  });
});

// Admin edit: POST update for booking
app.post('/admin/bookings/:id/edit', (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(403).send('Access denied. Admins only.');
  }
  const bookingId = req.params.id;
  const { venue_id, booking_date, name, booking_time } = req.body;
  
  console.log('Admin updating booking:', bookingId, req.body);
  
  const sql = 'UPDATE bookings SET venue_id = ?, booking_date = ?, name = ?, booking_time = ? WHERE id = ?';
  connection.query(sql, [venue_id, booking_date, name, booking_time, bookingId], (err, result) => {
    if (err) {
      console.error('Error updating booking:', err);
      return res.status(500).send('Error updating booking: ' + err.message);
    }
    if (result.affectedRows === 0) {
      return res.status(400).send('No booking updated. It may not exist.');
    }
    res.redirect('/admin/bookings');
  });
});

// Admin delete booking
app.post('/admin/bookings/:id/delete', (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(403).send('Access denied. Admins only.');
  }
  const bookingId = req.params.id;
  connection.query('DELETE FROM bookings WHERE id = ?', [bookingId], (err, result) => {
    if (err) {
      console.error('Error deleting booking:', err);
      return res.status(500).send('Error deleting booking.');
    }
    res.redirect('/admin/bookings');
  });
});

// Admin confirm booking – update status to Confirmed (1) and redirect back
app.post('/admin/bookings/:id/confirm', (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(403).send('Access denied. Admins only.');
  }
  const bookingId = req.params.id;
  connection.query('UPDATE bookings SET confirmed = 1 WHERE id = ?', [bookingId], (err, result) => {
    if (err) {
      console.error('Error confirming booking:', err);
      return res.status(500).send('Error confirming booking.');
    }
    res.redirect('/admin/bookings');
  });
});

// Admin decline booking – update status to Declined (2) and redirect back
app.post('/admin/bookings/:id/decline', (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(403).send('Access denied. Admins only.');
  }
  const bookingId = req.params.id;
  connection.query('UPDATE bookings SET confirmed = 2 WHERE id = ?', [bookingId], (err, result) => {
    if (err) {
      console.error('Error declining booking:', err);
      return res.status(500).send('Error declining booking.');
    }
    res.redirect('/admin/bookings');
  });
});


// ----- USER ROUTES -----

// User view: list bookings made by the logged-in user
app.get('/user/bookings', (req, res) => {
  if (!req.session.username) {
    return res.status(403).send('Please log in first.');
  }
  const username = req.session.username;
  connection.query('SELECT * FROM bookings WHERE name = ?', [username], (err, results) => {
    if (err) {
      console.error('Error retrieving bookings:', err);
      return res.status(500).send('Error retrieving bookings.');
    }
    res.render('userBookings', { title: 'Your Bookings', bookings: results, username: req.session.username, isAdmin: false });
  });
});

// User edit: GET form for editing their own booking
app.get('/user/bookings/:id/edit', (req, res) => {
  if (!req.session.username) {
    return res.status(403).send('Please log in first.');
  }
  const bookingId = req.params.id;
  connection.query('SELECT * FROM bookings WHERE id = ? AND name = ?', [bookingId, req.session.username], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).send('Booking not found or not authorized to edit.');
    }
    res.render('editBooking', { 
      title: 'Edit Your Booking', 
      booking: results[0], 
      action: `/user/bookings/${bookingId}/edit`,
      isAdmin: false,
      backLink: '/user/bookings',
      username: req.session.username
    });
  });
});

// User edit: POST update for booking
app.post('/user/bookings/:id/edit', (req, res) => {
  if (!req.session.username) {
    return res.status(403).send('Please log in first.');
  }
  const bookingId = req.params.id;
  const { venue_id, booking_date, booking_time } = req.body;
  
  console.log('User updating booking:', bookingId, req.body, 'for user:', req.session.username);
  
  const sql = 'UPDATE bookings SET venue_id = ?, booking_date = ?, booking_time = ? WHERE id = ? AND name = ?';
  connection.query(sql, [venue_id, booking_date, booking_time, bookingId, req.session.username], (err, result) => {
    if (err) {
      console.error('Error updating booking:', err);
      return res.status(500).send('Error updating booking: ' + err.message);
    }
    if (result.affectedRows === 0) {
      return res.status(400).send('No booking updated. It may not exist or you may not be authorized to update it.');
    }
    res.redirect('/user/bookings');
  });
});

// User delete booking
app.post('/user/bookings/:id/delete', (req, res) => {
  if (!req.session.username) {
    return res.status(403).send('Please log in first.');
  }
  const bookingId = req.params.id;
  connection.query('DELETE FROM bookings WHERE id = ? AND name = ?', [bookingId, req.session.username], (err, result) => {
    if (err) {
      console.error('Error deleting booking:', err);
      return res.status(500).send('Error deleting booking.');
    }
    res.redirect('/user/bookings');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
