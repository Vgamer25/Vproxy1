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

    // Parse the URL to find the target destination
    // In a real proxy, the destination is often encoded in the query string
    const query = url.parse(req.url, true).query;
    const targetUrl = query.url;

    if (!targetUrl) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Proxy Server is Active. Use ?url=https://example.com to browse.');
        return;
    }

    console.log(`Proxying request to: ${targetUrl}`);

    // Forward the request to the target website
    proxy.web(req, res, { target: targetUrl }, (e) => {
        console.error('Proxy Error:', e.message);
        res.writeHead(500);
        res.end('Could not reach the destination.');
    });
});

// Error handling for the proxy
proxy.on('error', (err, req, res) => {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Something went wrong with the proxy connection.');
});

server.listen(PORT, () => {
    console.log(`Scramjet-style server running at http://localhost:${PORT}`);
    console.log(`To use: http://localhost:${PORT}/?url=https://www.wikipedia.org`);
});
