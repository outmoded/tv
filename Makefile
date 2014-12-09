test:
	@node node_modules/lab/bin/lab test/index.js -a code -L
test-cov:
	@node node_modules/lab/bin/lab test/index.js -a code -t 100 -L
test-cov-html:
	@node node_modules/lab/bin/lab test/index.js -a code -r html -o coverage.html
test-client:
	@node node_modules/mocha-phantomjs/bin/mocha-phantomjs test/client/index.html --hooks test/client/phantomHooks.js

.PHONY: test test-cov test-cov-html test-client
