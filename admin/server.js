const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Simple authentication check
const isAuthenticated = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token === 'admin-token') {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple hardcoded credentials
  if (email === 'admin@budgettripplanner.com' && password === 'password') {
    res.json({
      success: true,
      token: 'admin-token',
      user: {
        id: 1,
        name: 'Admin User',
        email: email,
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

// Dashboard data
app.get('/api/dashboard', isAuthenticated, (req, res) => {
  res.json({
    stats: {
      totalBookings: 1247,
      totalRevenue: 45678,
      activeTrips: 89,
      totalUsers: 1234
    },
    recentBookings: [
      {
        id: 1,
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        type: 'flight',
        price: 450,
        status: 'confirmed',
        date: '2025-08-08'
      },
      {
        id: 2,
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        type: 'hotel',
        price: 320,
        status: 'pending',
        date: '2025-08-07'
      },
      {
        id: 3,
        customerName: 'Mike Johnson',
        customerEmail: 'mike@example.com',
        type: 'activity',
        price: 150,
        status: 'confirmed',
        date: '2025-08-06'
      }
    ],
    revenueChart: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      data: [12000, 15000, 18000, 22000, 25000, 28000, 32000, 35000, 38000, 42000, 45000, 48000]
    }
  });
});

// Bookings endpoint
app.get('/api/bookings', isAuthenticated, (req, res) => {
  const bookings = [
    {
      id: 1,
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      type: 'flight',
      title: 'New York to London',
      price: 450,
      status: 'confirmed',
      date: '2025-08-08'
    },
    {
      id: 2,
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      type: 'hotel',
      title: 'Grand Hotel Paris',
      price: 320,
      status: 'pending',
      date: '2025-08-07'
    },
    {
      id: 3,
      customerName: 'Mike Johnson',
      customerEmail: 'mike@example.com',
      type: 'activity',
      title: 'City Tour Barcelona',
      price: 150,
      status: 'confirmed',
      date: '2025-08-06'
    },
    {
      id: 4,
      customerName: 'Sarah Wilson',
      customerEmail: 'sarah@example.com',
      type: 'restaurant',
      title: 'Fine Dining Rome',
      price: 200,
      status: 'confirmed',
      date: '2025-08-05'
    }
  ];
  
  res.json({ bookings });
});

// Serve the main admin page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Catch all other routes and serve the main page
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Admin server running on port ${PORT}`);
  console.log(`📊 Admin dashboard: http://localhost:${PORT}`);
  console.log(`🔗 API health: http://localhost:${PORT}/api/health`);
  console.log(`📧 Login: admin@budgettripplanner.com / password`);
});
