var
  express  = require( 'express' ),
  app      = module.exports = express.createServer(),
  swag     = require( 'swag-blog' )( app );

// All default options, but shown for example

swag.set({
  postsPerPage : 2,
  posts        : './_posts',
  metaFormat   : 'json'
}).createPostRoute( '/post/:post', 'post' )
  .createPostListRoute( '/posts/:page', 'postList' )
  .createTagRoute( '/tag/:tag', 'tag' )
  .createCategoryRoute( '/category/:category', 'category' )
  .init();

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

require( './routes' )( app );

app.listen( 3000 );
