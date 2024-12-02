const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const https = require('https');

const app = express();

app.use(express.static(path.join(__dirname, 'build')));

const url = process.env.BACKEND_URL

app.use('/api', createProxyMiddleware({
    target: url,
    changeOrigin: true,
    pathRewrite: {'^/api': ''},
    logLevel: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    agent: new https.Agent({
        rejectUnauthorized: true
    })
}));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Proxying requests to: ${url}`);
});