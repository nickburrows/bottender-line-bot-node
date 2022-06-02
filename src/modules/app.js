const { router, line } = require('bottender/router');
const HandleMessage = require('./message');

function App() {
  return router([line.message(HandleMessage)]);
}

module.exports = App;
