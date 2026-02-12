/**
 * Scramjet-inspired Node.js Proxy Server
 * This server acts as a gateway to fetch content from other websites
 * and serve them to your browser interface.
 */

const http = require('http');
const httpProxy = require('http-proxy');
const url = require('url');

// Create the proxy server instance
const proxy = httpProxy.createProxyServer({
    changeOrigin: true,
    autoRewrite: true,
    followRedirects: true
});

// Port to run the server on
const PORT = 8080;

const server = http.createServer((req, res) => {
    // Basic CORS headers to allow your browser.html to talk to this server
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    
    // Health check endpoint to verify the server is actually reachable
    if (parsedUrl.pathname === '/ping') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'online', message: 'Proxy server is reachable!' }));
        return;
    }

    // Parse the URL to find the target destination
    const targetUrl = parsedUrl.query.url;

    if (!targetUrl) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <body style="font-family:sans-serif; background:#0f172a; color:white; padding:20px;">
                <h1>Proxy Server Active</h1>
                <p>The server is running correctly on port ${PORT}.</p>
                <p>To test a site directly, use: <a href="http://localhost:${PORT}/?url=https://www.wikipedia.org" style="color:#38bdf8;">this link</a></p>
            </body>
        `);
        return;
    }

    console.log(`[${new Date().toLocaleTimeString()}] Proxying to: ${targetUrl}`);

    // Forward the request to the target website
    proxy.web(req, res, { target: targetUrl }, (e) => {
        console.error('Proxy Error:', e.message);
        
        // Provide a more helpful error response if the target site fails
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end(`Proxy Error: Could not connect to ${targetUrl}. Detailed error: ${e.message}`);
    });
});

// Error handling for the proxy logic
proxy.on('error', (err, req, res) => {
    if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
    }
    res.end('The proxy encountered an internal error.');
});

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please close other programs using this port.`);
    } else {
        console.error('Server Error:', e);
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log('========================================');
    console.log(`Scramjet-style server: ONLINE`);
    console.log(`Address: http://localhost:${PORT}`);
    console.log(`Status: Listening for browser requests...`);
    console.log('========================================');
});
