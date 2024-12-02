const express = require('express');
const cors = require('cors');
const { requestRateMiddleware, responseTimeMiddleware, metricsMiddleware, metricsEndpoint } = require('./utils/metrics');
const errorHandler = require('./middleware/error');

// Route imports
const authRoutes = require('./routes/auth');
const locationRoutes = require('./routes/location');
const departmentRoutes = require('./routes/department');
const personnelRoutes = require('./routes/personnel');

const app = express();
const port = 4000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(metricsMiddleware);
app.use(responseTimeMiddleware);
app.use(requestRateMiddleware);


// Routes
app.use('/auth', authRoutes);
app.use('/locations', locationRoutes);
app.use('/departments', departmentRoutes);
app.use('/personnel', personnelRoutes);

// Metrics endpoint
app.get('/metrics', metricsEndpoint);

// Add this with your other routes
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// Error handling
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
});
