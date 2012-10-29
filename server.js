var
  express  = require( 'express' ),
  app      = express(),
  poet     = require( 'poet' )( app );

poet.set({
  postsPerPage : 5,
  posts        : __dirname + '/_posts',
  metaFormat   : 'json'
}).createPostRoute( '/post/:post', 'post' )
  .createPageRoute( '/page/:page', 'page' )
  .createTagRoute( '/tag/:tag', 'tag' )
  .createCategoryRoute( '/category/:category', 'category' )
  .init();

app.set( 'views', __dirname + '/views' );
app.set( 'view engine', 'jade' );
app.use( express.static( __dirname + '/public' ));
app.use( app.router );
app.use( notFoundFn );

app.configure('development', function () {
  app.use( express.errorHandler({ dumpExceptions: true, showStack: true }) );
});

app.configure( 'production', function () {
  app.use( express.errorHandler() );
});

require( './routes' )( app );

app.listen( 3333 );

function notFoundFn ( req, res ) {
  if ( req.accepts( 'html' )) {
    res.status( 404 );
    res.render( '404', { url: req.url });
    return;
  }
}
