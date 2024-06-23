
const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');
const auth = require('./middleware/auth');
const protect = require('./middleware/protect');
const logger = require('./middleware/logger');
const swagger = require('./config/swagger');

dotenv.config();

const app = express();

// Connect to database
connectDB();

// Init Middleware
app.use(express.json());
app.use(cors());
app.use(logger);
app.use(protect);

// Define Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/contents', require('./routes/contentRoutes'));
app.use('/api/assessments', require('./routes/assessmentRoutes'));
app.use('/api/forums', require('./routes/forumRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/public', require('./routes/apiRoutes'));

// Swagger Docs
swagger(app);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
