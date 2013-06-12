{{{
  "title" : "Places API Coming to Jetpacks",
  "tags" : [ "jetpack", "api design" ],
  "category" : "jetpack",
  "date" : "6-04-2013",
  "description" : "Overview of some API design goals of creating a good, intuitive, usable API."
}}}

[Places](https://developer.mozilla.org/en-US/docs/Places), Firefox's bookmark and history management system, is coming to [Firefox Add-on SDK](https://addons.mozilla.org/en-US/developers/) for add-on developers to easily manipulate bookmarks and query browsing history.

The Places API initial implementation is scheduled to hit Firefox 24 (aurora) later this month, and the current API proposal can be found in the [addon-sdk wiki](https://github.com/mozilla/addon-sdk/wiki/JEP-places-API), with current implementation progress in my [places-api branch](https://github.com/jsantell/addon-sdk/tree/places-api).

The platform's Places API has recently [implemented async services](http://forums.mozillazine.org/viewtopic.php?f=19&t=2649539), so all methods in the add-on Places API will be async, even if currently not implemented as such on the platform to be consistent with future changes.

Now to the sneak peak at the APIs and shedding some transparency on the design decisions behind them! [Arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/arrow_functions) are used in the examples, implemented in Firefox 22, and used here for terseness, and that they're sweet.

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

The most difficult concept to tackle regarding bookmarks was keeping the state in check. We could've opted for an object-oriented approach, with methods on instances, and observers syncing any bookmark changes from other add-ons or the user, caching each bookmark created and returned from a query so there's only one instance per actual bookmark... but instead we went for a more stateless approach, with less moving parts and orienting the API around the idea that the bookmark items are **snapshots of an item's current state**, not representations of the items themselves. This influenced most of the subsequent design decisions.

* **Emitters versus Promises**: The `save` function returns an [EventEmitter](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/modules/sdk/event/target.html) rather than [Promises](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/modules/sdk/core/promise.html) because saving can return a collection of information, rather than a single computation. Handling errors would be ambiguous with a promise representing multiple computations, and this allows result callbacks to trigger as they come in, rather than waiting for all to complete (or fail).

* **Implicit Structure Saving**: Notice in the above example, we just save `bookmark1` and `bookmark2`, both which are children of `group`, which is not being explicitly saved. `group` will be regarded as a dependency and saved implicitly before the bookmarks are saved, resulting in what one would expect -- two bookmarks saved as children of a group.
* **Folders versus Groups**: In the Firefox UI, bookmarks are stored in folders. While this is how items' categorization is usually represented in operating systems, [that could change in the future](http://ia.net/blog/mountain-lions-new-file-system/). Using the term `Groups` is more futureproof, and the concept that folders ultimately represent.

* **Returning new states**: In the above `data` and `end` handlers, the objects passed in as arguments are new `Bookmark` or `Group` objects, and do not equal the constructors used to save them. This is an important note in again focusing on these being **state snapshots**.

* **Duck Typing**: `bookmark2` is just an object literal with a `type` property. The other constructors (`Bookmark`, `Group`, `Separator`) are just fancy data structures with validation handling, and accepting duck-typed literals allows different ways to construct a save call, and again, bringing home the fact that the constructors are just data structures, not powerful objects with methods.

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
  });
</pre>

The bookmark search tries to be as smart as it can, grabbing data from [three](https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsINavBookmarksService) [different](https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsINavHistoryService) [services](https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsITaggingService), and using native platform methods when possible.

* **Robust Querying**: Similar to the [history querying service](https://developer.mozilla.org/en-US/docs/Querying_Places), this API supports multiple query options. Parameters within an option are AND'd together, while the results of each query option are OR'd together, resulting in terseness for simple queries, while being expressive for more complex queries.


### Composing

<pre>
  
</pre>

Looking forward to the places API? Comments, criticisms on the design decisions? Lets hear it!
