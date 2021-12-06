const http = require("http");
const PORT = 8080;

// a function which handles requests and sends response
const requestHandler = function(request, response) {
  let route = `${request.method} ${request.url}`
  switch (route) {
    case 'GET /':
      response.write('Welcome')
      break;
    case 'GET /urls':
      response.write('some urls')
      break;
    default : 
    response.write('404 not found')
  }
  response.end(`Requested Path: ${request.url}\nRequest Method: ${request.method}`);
};

const server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.log(`Server listening on: http://localhost:${PORT}`);
});
