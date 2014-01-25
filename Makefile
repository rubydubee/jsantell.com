PUBLIC=./public
STYLUS=./node_modules/stylus/bin/stylus
UGLIFY=./node_modules/uglify-js/bin/uglifyjs
CLEANCSS=./node_modules/clean-css/bin/cleancss

all: stylus concat min

stylus:
	mkdir -p $(PUBLIC)/css
	rm -f $(PUBLIC)/css/layout.css
	@for style in `ls $(PUBLIC)/styles/*.styl`; do \
		node $(STYLUS) < $$style >> $(PUBLIC)/css/layout.css ; \
	done

concat:
	echo "var ENV_GA='$(JSANTELL_COM_GA)';\n" > $(PUBLIC)/js/site.js
	echo "window.initDisqus && initDisqus('$(JSANTELL_COM_DISQUS)');\n" >> $(PUBLIC)/js/site.js
	cat $(PUBLIC)/js/ga.js >> $(PUBLIC)/js/site.js
	cat $(PUBLIC)/js/jquery.js >> $(PUBLIC)/js/site.js
	cat $(PUBLIC)/js/jquery.sharrre.js >> $(PUBLIC)/js/site.js
	cat $(PUBLIC)/js/jquery.tweet.js >> $(PUBLIC)/js/site.js
	cat $(PUBLIC)/js/prettify.js >> $(PUBLIC)/js/site.js
	cat $(PUBLIC)/js/ui.js >> $(PUBLIC)/js/site.js
	
	cat $(PUBLIC)/css/normalize.css > $(PUBLIC)/css/site.css
	cat $(PUBLIC)/css/layout.css >> $(PUBLIC)/css/site.css
	cat $(PUBLIC)/css/font-awesome.css >> $(PUBLIC)/css/site.css
	cat $(PUBLIC)/css/prettify.css >> $(PUBLIC)/css/site.css

min:
	node $(UGLIFY) $(PUBLIC)/js/site.js -o $(PUBLIC)/js/site.min.js
	node $(CLEANCSS) $(PUBLIC)/css/site.css -o $(PUBLIC)/css/site.min.css

.PHONY: stylus concat min
