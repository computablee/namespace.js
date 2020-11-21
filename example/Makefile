CC=gcc
NAMESPACE=node ../namespace.js
PREFIX=namespace_

main: source.c
	$(NAMESPACE) $<
	$(CC) -o main $(PREFIX)$<

clean:
	rm main
