# Scaling Roadmap

- Add a persistent JSON index cache keyed by file path, mtime, and size when markdown volume becomes large enough to make startup slow.
- Add optional file watching for long-lived desktop sessions, but keep it disabled by default to reduce idle memory.
- Split ranking into two stages if recall becomes weak: lexical prefilter by token map, then Fuse over candidate segments.
- Add result filters for `docs`, `lore`, `combat`, `magic`, and `survival` after real usage shows repeated query scopes.
- Add structured citations with line ranges if downstream tools need exact source attribution.
- Add benchmark fixtures that track startup time, index size, and median query latency.
