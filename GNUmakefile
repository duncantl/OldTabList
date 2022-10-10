all: build sign

build:
	@-rm *~
	web-ext build

sign:
	web-ext sign --api-key=$(MOZ_DEV_KEY) --api-secret=$(MOZ_DEV_SECRET)


# /Applications/Firefox.app/Contents/MacOS/firefox  -profile "/Users/duncan/Library/Application Support/Firefox/Profiles/federo72.Test"