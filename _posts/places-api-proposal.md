{{{
  "title" : "Jetpack's Places API Proposal",
  "tags" : [ "jetpack", "api design" ],
  "category" : "jetpack",
  "date" : "6-13-2013",
  "description" : "Jetpack's Places API proposal, showing examples, and proposed API for manipulating Firefox's bookmarks and history"
}}}

[Places](https://developer.mozilla.org/en-US/docs/Places), Firefox's bookmark and history management system, is coming to [Firefox Add-on SDK](https://addons.mozilla.org/en-US/developers/) for add-on developers to easily manipulate bookmarks and query browsing history. Current API proposal, examples, and design decisions below!

<img src="/img/posts/jetpack.png" class="center" alt="Jetpacks" />

<!--more-->

The Places API initial implementation is scheduled to hit Firefox 24 (aurora) later this month, and the current API proposal can be found in the [addon-sdk wiki](https://github.com/mozilla/addon-sdk/wiki/JEP-places-API), with current implementation progress in my [places-api branch](https://github.com/jsantell/addon-sdk/tree/places-api).

The platform's Places API has recently [implemented async services](http://forums.mozillazine.org/viewtopic.php?f=19&t=2649539), so all methods in the add-on Places API will be async, even if currently not implemented as such on the platform to be consistent with future changes.

Now to the sneak peak at the APIs and shedding some transparency on the design decisions behind them! This post will just cover the bookmarks API, with the history querying API  preview coming in a future post. [Arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/arrow_functions) are used in the examples, implemented in Firefox 22, and used here for terseness, and that they're sweet.

## Bookmarks

Developers will be able to create [bookmarks](https://github.com/mozilla/addon-sdk/wiki/JEP-Places-API#bookmarkproperties), [bookmark folders](https://github.com/mozilla/addon-sdk/wiki/JEP-Places-API#groupproperties), and [bookmark separators](https://github.com/mozilla/addon-sdk/wiki/JEP-Places-API#separatorproperties), modify and search for bookmarks.

### Creating a new folder with two new bookmarks

<pre>
  let { Bookmark, Group, save } = require('sdk/places/bookmarks');

  let group = Group({ title: "Jetpackers" });
  let bookmark1 = Bookmark({
    title: 'Erik Vold\'s huge list of add-ons',
    url: 'https://addons.mozilla.org/en-us/firefox/user/erikvold/',
    tags: ['firefox', 'jetpack', 'erikvold'],
    group: group
  });
  let bookmark2 = {
    type: 'bookmark',
    title: 'AMO',
    tags: new Set(['firefox', 'jetpack']);
    url: 'https://addons.mozilla.org'
  }

  save([bookmark1, bookmark2]).on('data', (savedBookmark) =>
    console.log('A bookmark has been saved!');
  ).on('end', (bookmarks) =>
    console.log('All bookmarks have been saved!');
  );
</pre>

The most difficult concept to tackle regarding bookmarks was keeping the state in check. We could've opted for an object-oriented approach, with methods on instances, and observers syncing any bookmark changes from other add-ons or the user, caching each bookmark created and returned from a query so there's only one instance per actual bookmark... but instead we went for a more stateless approach, with less moving parts and orienting the API around the idea that the bookmark items are **snapshots of an item's state at a given time**, not representations of the items themselves. This influenced most of the subsequent design decisions.

* **Emitters versus Promises**: The `save` function can accept a single item, or an array of items in order for developers to define tasks to be saved, and the SDK handles the most efficient/best way and order to perform the operation. Because saving can return a collection rather than a single computation, `save` returns an [EventEmitter](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/modules/sdk/event/target.html) rather than a [Promise](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/modules/sdk/core/promise.html). Handling errors would be ambiguous with a promise representing multiple computations, and this allows result callbacks to trigger as they come in, rather than waiting for all to complete (or fail).

* **Implicit Structure Saving**: Notice in the above example, we just save `bookmark1` and `bookmark2`, both which are children of `group`, which is not being explicitly saved. `group` will be regarded as a dependency and saved implicitly before the bookmarks are saved, resulting in what one would expect -- two bookmarks saved as children of a group. Items are only implicitly saved if explicit items are dependent on the existence of the group. If the group already existed, it would not be resaved/updated.

* **Folders versus Groups**: In the Firefox UI, bookmarks are stored in folders. While this is how items' categorization is usually represented in operating systems, [that could change](http://jansen.co/files-and-folders#) [in the future](http://ia.net/blog/mountain-lions-new-file-system/). Using the term `Groups` is more futureproof, and the concept that folders ultimately represent.

* **Returning new states**: In the above `data` and `end` handlers, the objects passed in as arguments are new `Bookmark` or `Group` objects, and do not equal the constructors used to save them. This is an important note in again focusing on these being **state snapshots**.

* **Duck Typing**: `bookmark2` is just an object literal with a `type` property. The other constructors (`Bookmark`, `Group`, `Separator`) are just fancy data structures with validation handling, and accepting duck-typed literals allows different ways to construct a save call, and again, bringing home the fact that the constructors are just data structures, not powerful objects with methods.


### Updating/Deleting

<pre>
  let { Bookmark, save, remove } = require('sdk/places/bookmarks');

  let bookmark = Bookmark({ title: 'moz', url: 'http://mozilla.org' });
  save(bookmark)

  // ... later on we want to update the URL
  // depending on user's country

  bookmark.url = 'http://www.mozilla.org/en-US/';
  save(bookmark, { resolve: function (mine, theirs) {
    theirs.url = mine.url;
    return theirs;
  }}).on('data', (bm) =>
    // Bookmark was saved, only overwriting the URL property
  );

  // later on we want to delete the bookmark,
  // so we use the remove transformation function
  save(remove(bookmark)).on('end', () =>
    // Bookmark is deleted
  );

</pre>

The `save` method is not only used for the creation of new bookmark items, but for updating existing items as well. It accepts an optional `option` object with the property `resolve` to handle conflicts when attempting to save with an object that no longer matches what is on the host.

* **Resolving state discrepencies**: When saving a 'stale' bookmark, the last updated time is checked on the state snapshot, as well as the host. If the host bookmark has changed (by a user or an add-on), the `resolve` function is called, where you can either clobber all of the current changes (`return mine`), skip your changes (`return theirs`, which is default), or do smart diff'ing (like in the example above). You probably don't want your add-on blindly ignoring a user's changes, so use this with discretion.

* **Remove is a transformation**: Each bookmark item has a `removed` property -- if `true` while saving, the bookmark item is removed. The function `remove` just transforms the data, allowing it to be removed on the next `save` call if passed in. Check out the [composing](#composing) section for examples.

* **Create, update, remove with same method**: This allows more expressive task composition; pass in an array of bookmark items, whether new, already saved, being deleted, doesn't matter. It'll handle it for you.

### Searching

<pre>
  // Search by title, URL
  search({ query: 'jetpackers' });

  // Search by URL
  search({ url: '*.mozilla.org' });

  // Search by tags
  search({ tags: 'firefox' });

  // Search by parent group
  search({ group: myGroup });

  // Compose complex queries with multiple search options
  // This query matches bookmarks that either have a 'firefox'
  // tag OR are in `myMozFolder` with a url under mozilla.org
  search({
    tags: ['firefox', 'mozilla']
  }, {
    url: '*.mozilla.org',
    group: myMozFolder
  }).on('end', (bookmarks) =>
    // `bookmarks` contains an array of bookmarks that match the results
  );
</pre>

The bookmark search tries to be as smart as it can, grabbing data from [three](https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsINavBookmarksService) [different](https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsINavHistoryService) [services](https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsITaggingService), and using native platform methods when possible.

* **Robust Querying**: Similar to the [history querying service](https://developer.mozilla.org/en-US/docs/Querying_Places), this API supports multiple query options. Parameters within an option are AND'd together, while the results of each query option are OR'd together, resulting in terseness for simple queries, while being expressive for more complex queries.


<h3 id="composing">Composing</h3>

<pre>
  let { save, remove } = require('sdk/places/bookmarks');

  search({ tag: 'JavaScript' }).on('end', process);

  function process (bookmarks) {
    let erase = bookmarks.filter((bookmark) =>
      ~bookmark.url.indexOf("http://www.w3schools.com/")
    ).map(remove);

    let updateTags = bookmarks
      .filter((bookmark) => !~erase.indexOf(bookmark))
      .forEach(switchTags.bind(null, 'JavaScript', 'JS'));

    save([updateTags, erase]).on('end', () =>
      // all done!
    );
  }

  function switchTags (tagToAdd, tagToRemove, bookmark) {
    bookmark.tags.delete(tagToRemove)
    bookmark.tags.add(tagToAdd)
  }
</pre>

In the above example, we query for all bookmark items with a `JavaScript` tag, remove all of those that have `'http://www.w3schools.com'` as a URL (because, [seriously](http://www.w3fools.com/)), and change the tags of the remaining from `JavaScript` to `JS`. The ability to construct a collection of items that will eventually be modified (whether deleted, updated, or created), becomes a powerful composition technique, and hopefully justifies the direction we went with this API.


Looking forward to the places API? Comments, criticisms on the design decisions? Lets hear it!
