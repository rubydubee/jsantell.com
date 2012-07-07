module.exports = function ( app ) {
  
  app.get( '/', function ( req, res ) { res.render('index'); });
  app.get( '/posts/[0-9]', pageRoute );
  app.get( '/posts/:slug', postRoute );
  app.get( '/category/:category', categoryRoute );
  app.get( '/tag/:tag', tagRoute );

  function pageRoute ( req, res, next ) {
    var
      page = req.params[0],
      postsPerPage = 5;
      lastPost = page * postsPerPage;
    res.render( 'lists', {
      posts : req.swag.orderedPosts.slice( lastPost - postsPerPage, lastPost ),
      page  : page
    });
  }

  function postRoute ( req, res, next ) {
    var slug = req.params.slug;
    if ( posts[ slug ] ) {
      res.render( 'posts', { post: req.swag.posts[ slug ] });
    } else {
      next();
    }
  }

  function categoryRoute ( req, res, next ) {
    var cat = req.params.category;
    if ( ~categories.indexOf( cat )) {
      res.render( 'category', {
        posts    : req.swag.getPostsWithCategory( cat ),
        category : cat
      });
    } else {
      next();
    }
  }

  function tagRoute ( req, res, next ) {
    var tag = req.params.tag;
    if ( ~tags.indexOf( tag ) ) {
      res.render( 'tag', {
        posts : req.swag.getPostsWithTag( tag ),
        tag   : tag
      });
    } else {
      next();
    }
  }

};
