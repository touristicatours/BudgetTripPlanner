# BudgetTripPlanner Admin Backend

A comprehensive admin management system for BudgetTripPlanner, providing complete control over bookings, trips, users, and business analytics.

## 🚀 Features

### 📊 **Dashboard Analytics**
- Real-time revenue tracking
- Booking statistics and trends
- Top destinations analysis
- Monthly performance charts
- Recent activity overview

### 📋 **Bookings Management**
- View all customer bookings
- Filter by status (Confirmed, Pending, Cancelled)
- Filter by type (Flight, Hotel, Activity, Restaurant)
- Update booking status in real-time
- Delete bookings with confirmation
- Customer information tracking

### 🗺️ **Trips Management**
- Monitor all customer trips
- Search by destination
- Filter by trip status
- View trip details and costs
- Track trip completion status

### 👥 **Users Management**
- View all registered users
- User role management
- Account status tracking
- User activity monitoring

### 📈 **Reports & Analytics**
- Revenue reports with charts
- Booking type distribution
- Destination popularity analysis
- Monthly trend analysis
- Export capabilities

### ⚙️ **System Settings**
- Company information management
- System configuration
- Maintenance mode toggle
- Email notification settings
- Feature toggles

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Modern web browser

### Local Development Setup

1. **Clone and navigate to admin directory**
```bash
cd admin
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env
```

4. **Configure environment variables**
```env
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
JWT_SECRET=your-secret-key-here
```

5. **Start development server**
```bash
npm run dev
```

6. **Access admin dashboard**
```
http://localhost:5000/admin
```

### Default Login Credentials
- **Email**: admin@budgettripplanner.com
- **Password**: password

## 🌐 Deployment Options

### Option 1: Heroku Deployment

1. **Create Heroku app**
```bash
heroku create budgettripplanner-admin
```

2. **Set environment variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-production-secret
heroku config:set ALLOWED_ORIGINS=https://yourdomain.com
```

3. **Deploy**
```bash
git push heroku main
```

### Option 2: Railway Deployment

1. **Connect to Railway**
```bash
railway login
railway init
```

2. **Set environment variables in Railway dashboard**
3. **Deploy**
```bash
railway up
```

### Option 3: DigitalOcean App Platform

1. **Create app in DigitalOcean dashboard**
2. **Connect your GitHub repository**
3. **Set environment variables**
4. **Deploy automatically**

### Option 4: Vercel Deployment

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel --prod
```

## 📁 Project Structure

```
admin/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── public/               # Static files
│   ├── admin.html        # Admin dashboard UI
│   └── admin.js          # Frontend JavaScript
├── .env                  # Environment variables
└── README.md            # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login

### Dashboard
- `GET /api/dashboard/analytics` - Dashboard analytics data

### Bookings Management
- `GET /api/bookings` - List all bookings
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/status` - Update booking status
- `DELETE /api/bookings/:id` - Delete booking

### Trips Management
- `GET /api/trips` - List all trips
- `GET /api/trips/:id` - Get trip details

### Users Management
- `GET /api/users` - List all users

### Reports
- `GET /api/reports/revenue` - Revenue reports
- `GET /api/reports/destinations` - Destination reports

### Settings
- `GET /api/settings` - Get system settings
- `PUT /api/settings` - Update system settings

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Rate Limiting** - API request throttling
- **CORS Protection** - Cross-origin request security
- **Helmet.js** - Security headers
- **Input Validation** - Request data sanitization
- **Error Handling** - Comprehensive error management

## 📊 Data Management

### Current Implementation
- **In-Memory Storage** - For demo purposes
- **Mock Data** - Sample bookings, trips, and analytics

### Production Recommendations
- **Database**: PostgreSQL or MongoDB
- **Caching**: Redis for performance
- **File Storage**: AWS S3 or similar
- **Email Service**: SendGrid or AWS SES
- **Monitoring**: New Relic or DataDog

## 🎨 UI Features

- **Responsive Design** - Works on all devices
- **Modern Interface** - Clean, professional design
- **Real-time Updates** - Live data refresh
- **Interactive Charts** - Chart.js integration
- **Filtering & Search** - Advanced data filtering
- **Bulk Actions** - Mass operations support

## 🔄 Integration

### Frontend Integration
The admin backend can be integrated with your main BudgetTripPlanner frontend:

```javascript
// Example API call from frontend
const response = await fetch('https://your-admin-domain.com/api/bookings', {
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  }
});
```

### Webhook Support
Add webhook endpoints for real-time updates:

```javascript
// Example webhook endpoint
app.post('/api/webhooks/booking-created', (req, res) => {
  // Handle new booking notifications
  // Send emails, update analytics, etc.
});
```

## 🚀 Performance Optimization

### Current Optimizations
- **Compression** - Gzip response compression
- **Caching** - Static file caching
- **Rate Limiting** - API protection
- **Efficient Queries** - Optimized data fetching

### Additional Recommendations
- **CDN** - Content delivery network
- **Database Indexing** - Query optimization
- **Load Balancing** - Traffic distribution
- **Monitoring** - Performance tracking

## 🛡️ Backup & Recovery

### Data Backup Strategy
1. **Regular Backups** - Daily automated backups
2. **Multiple Locations** - Geographic redundancy
3. **Version Control** - Code and configuration backup
4. **Disaster Recovery** - Quick restoration procedures

## 📞 Support & Maintenance

### Regular Maintenance
- **Security Updates** - Keep dependencies updated
- **Performance Monitoring** - Track system health
- **Backup Verification** - Ensure data integrity
- **User Training** - Admin user education

### Troubleshooting
- **Logs** - Check server logs for errors
- **Health Check** - `/api/health` endpoint
- **Database** - Verify data connectivity
- **Network** - Check firewall and DNS settings

## 🔮 Future Enhancements

### Planned Features
- **Multi-language Support** - Internationalization
- **Advanced Analytics** - Machine learning insights
- **Mobile App** - Native admin mobile app
- **API Documentation** - Swagger/OpenAPI docs
- **Webhook System** - Real-time integrations
- **Advanced Reporting** - Custom report builder

### Integration Opportunities
- **Payment Processing** - Stripe/PayPal integration
- **Email Marketing** - Mailchimp integration
- **CRM Integration** - Salesforce/HubSpot
- **Accounting Software** - QuickBooks/Xero
- **Social Media** - Marketing automation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Contact

For support or questions:
- **Email**: admin@budgettripplanner.com
- **Documentation**: [Link to docs]
- **Issues**: [GitHub Issues]

---

**Built with ❤️ for BudgetTripPlanner**







