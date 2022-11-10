
clean-cli:
	rm -rf ./bin/cli

build-cli: clean-cli
	go build -o ./bin/cli ./cmd/cli/...

clean: clean-cli

build: build-cli