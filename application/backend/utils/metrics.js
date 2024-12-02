const promBundle = require('express-prom-bundle');
const promClient = require('prom-client');

// Initialize metrics middleware
const metricsMiddleware = promBundle({
    includeMethod: true,
    includePath: true,
    includeStatusCode: true,
    includeUp: true,
    customLabels: { app: 'express-app' },
    promClient: {
        collectDefaultMetrics: {
            timeout: 5000
        }
    }
});

// Custom metrics
const metrics = {
    httpResponseDuration: new promClient.Histogram({
        name: 'http_response_time_seconds',
        help: 'Duration of HTTP requests in seconds',
        labelNames: ['method', 'route', 'status_code'],
        buckets: [0.1, 0.5, 1, 2, 5]
    }),

    errorCount: new promClient.Counter({
        name: 'error_total',
        help: 'Total number of errors',
        labelNames: ['type', 'route']
    }),

    dbQueryDuration: new promClient.Histogram({
        name: 'db_query_duration_seconds',
        help: 'Duration of database queries in seconds',
        labelNames: ['query_type'], // Added label for query type
        buckets: [0.1, 0.5, 1, 2, 5]
    }),

    activeConnections: new promClient.Gauge({
        name: 'db_connections_active',
        help: 'Number of active database connections'
    }),

    requestRate: new promClient.Counter({
        name: 'http_requests_per_second',
        help: 'Number of HTTP requests per second',
        labelNames: ['method', 'path']
    }),

    userLoginCounter: new promClient.Counter({
        name: 'user_login_total',
        help: 'Total number of user logins'
    }),

    activeUsers: new promClient.Gauge({
        name: 'active_users_total',
        help: 'Number of currently active users'
    }),

    dbErrors: new promClient.Counter({
        name: 'db_error_total',
        help: 'Database error count',
        labelNames: ['type']
    }),

    memoryUsage: new promClient.Gauge({
        name: 'app_memory_usage_bytes',
        help: 'Application memory usage in bytes'
    })
};

// Memory usage monitoring
setInterval(() => {
    const used = process.memoryUsage();
    metrics.memoryUsage.set(used.heapUsed);
}, 5000);

// Improved DB instrumentation
const instrumentDB = (pool) => {
    // Create a wrapped pool that maintains all original methods
    const wrappedPool = {
        ...pool,
        query: async (text, params) => {
            const queryType = text.trim().split(' ')[0].toUpperCase();
            const timer = metrics.dbQueryDuration.startTimer();
            
            try {
                const result = await pool.query(text, params);
                timer({ query_type: queryType });
                return result;
            } catch (error) {
                metrics.dbErrors.inc({
                    type: error.code || 'unknown'
                });
                throw error;
            }
        },
        connect: async () => {
            metrics.activeConnections.inc();
            try {
                const client = await pool.connect();
                return client;
            } catch (error) {
                metrics.activeConnections.dec();
                metrics.dbErrors.inc({
                    type: error.code || 'unknown'
                });
                throw error;
            }
        }
    };

    // Maintain event listeners
    pool.on('error', (err) => {
        metrics.dbErrors.inc({
            type: err.code || 'unknown'
        });
    });

    pool.on('remove', () => {
        metrics.activeConnections.dec();
    });

    return wrappedPool;
};

// Response time middleware
const responseTimeMiddleware = (req, res, next) => {
    const start = process.hrtime();

    res.on('finish', () => {
        const duration = process.hrtime(start);
        const seconds = duration[0] + duration[1] / 1e9;

        metrics.httpResponseDuration.observe(
            {
                method: req.method,
                route: req.route?.path || req.path,
                status_code: res.statusCode
            },
            seconds
        );

        if (res.statusCode >= 400) {
            metrics.errorCount.inc({
                type: res.statusCode >= 500 ? 'server_error' : 'client_error',
                route: req.route?.path || req.path
            });
        }
    });

    next();
};

// Request rate middleware
const requestRateMiddleware = (req, res, next) => {
    metrics.requestRate.inc({
        method: req.method,
        path: req.route?.path || req.path
    });
    next();
};

// Metrics endpoint middleware
const metricsEndpoint = async (req, res) => {
    res.set('Content-Type', promClient.register.contentType);
    const metrics = await promClient.register.metrics();
    res.send(metrics);
};

module.exports = {
    metricsMiddleware,
    metrics,
    instrumentDB,
    metricsEndpoint,
    responseTimeMiddleware,
    requestRateMiddleware
};