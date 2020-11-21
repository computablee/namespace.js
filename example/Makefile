CC=gcc
NAMESPACE=node ../namespace.js
PREFIX=namespace_

main: source.c
	$(NAMESPACE) source.c
	$(CC) -o main $(PREFIX)source.c

clean:
	rm main