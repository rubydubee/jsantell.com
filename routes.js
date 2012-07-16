module.exports = function ( app ) {

  app.get( '/', function ( req, res ) {
    res.render( 'index', {
      title: 'Jordan Santell'
    });
  });

  app.get( '/projects', function ( req, res ) {
    res.render( 'projects', {
      title: 'Projects * Jordan Santell'
    });
  });

  app.get( '/tags', function ( req, res ) {
    res.render( 'tags', {
      title: 'Tags * Jordan Santell'
    });
  });

  app.get( '/categories', function ( req, res ) {
    res.render( 'categories', {
      title: 'Categories * Jordan Santell'
    });
  });
};
