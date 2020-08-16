const http = require('http');

http.createServer((request, response) => {
  let body = [];
  request.on('error', (err) => {
    console.error(err);
  }).on('data', (data) => {
    body.push(chunk.toString());
  }).on('end', () => {
    body = Buffer.concat(body).toString;
    console.log('body', body);
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end(`
      <html maaa='a'>
        <head><head>
        <body>
          <header>Hello World</header>
        </body>
      </html>
    `);
  });
}).listen(8088);

console.log('server started')