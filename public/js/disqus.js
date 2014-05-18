(function () {
  // Just bake in disqus account name, now have it blocked on other domains
  // when people fork this repo
  disqus_shortname = 'jordansantell';
  var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
  dsq.src = 'http://' + disqus_shortname + '.disqus.com/embed.js';
  (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
})();
