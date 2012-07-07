var
  express  = require('express'),
  swag     = require('swag-blog'),
  app      = module.exports = express.createServer();

swag( app, {
  posts: './_posts/',
  route: '/post/'
});

app.configure(function () {
  app.set( 'views', __dirname + '/views' );
  app.set( 'view engine', 'jade' );
  app.use( express.static( __dirname + '/public' ));
  app.use( app.router );
});

app.configure('development', function () {
  app.use( express.errorHandler({ dumpExceptions: true, showStack: true }) );
});

app.configure( 'production', function () {
  app.use( express.errorHandler() );
});




app.listen( 3000 );
