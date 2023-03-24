ifneq (grouped-target, $(findstring grouped-target,$(.FEATURES)))
ERROR:=$(error This version of make does not support required 'grouped-target' (4.3+).)
endif

.DELETE_ON_ERROR:
.PHONY: all lint lint-fix test qa

default: all

NPM_BIN:=npm exec
CATALYST_SCRIPTS:=$(NPM_BIN) catalyst-scripts

SRC:=src
LIB_SRC_FILES:=$(shell find $(SRC) \( -name "*.js" -o -name "*.mjs" \) -not -path "*/test/*" -not -name "*.test.js")
ALL_SRC_FILES:=$(shell find $(SRC) -name "*.js" -o -name "*.mjs")
TEST_BUILT_FILES=$(patsubst %.mjs, %.js, $(patsubst $(SRC)/%, test-staging/%, $(ALL_SRC_FILES)))
LIB:=dist/liq-server.js

BUILD_TARGETS:=$(LIB)

all: $(BUILD_TARGETS)

# build rules
$(LIB): package.json $(LIB_SRC_FILES)
	JS_SRC=$(SRC) $(CATALYST_SCRIPTS) build

# test build and run rules
$(TEST_BUILT_FILES) &: $(ALL_SRC_FILES)
	JS_SRC=$(SRC) $(CATALYST_SCRIPTS) pretest


last-test.txt: $(TEST_BUILT_FILES)
	( set -e; set -o pipefail; \
		JS_SRC=$(TEST_STAGING) $(CATALYST_SCRIPTS) test 2>&1 | tee last-test.txt; )

test: last-test.txt

# lint rules
last-lint.txt: $(ALL_SRC_FILES)
	( set -e; set -o pipefail; \
		JS_LINT_TARGET=$(SRC) $(CATALYST_SCRIPTS) lint | tee last-lint.txt; )

lint: last-lint.txt

lint-fix:
	JS_LINT_TARGET=$(SRC) $(CATALYST_SCRIPTS) lint-fix

qa: test lint
