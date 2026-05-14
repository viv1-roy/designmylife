require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   DesignMyLife Server Running          ║
║   Port: ${PORT}                        ║
║   Environment: ${process.env.NODE_ENV || 'development'}         ║
╚════════════════════════════════════════╝
  `);
});
