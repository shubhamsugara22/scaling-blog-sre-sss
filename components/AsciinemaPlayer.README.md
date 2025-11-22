# AsciinemaPlayer Component

A React component for embedding Asciinema terminal recordings in blog posts.

## Features

- Supports both code block and shortcode syntax in markdown
- Configurable playback options (theme, speed, autoplay, loop)
- Graceful error handling with fallback messages
- Lazy loading for optimal performance
- Automatic cleanup on unmount

## Usage in Markdown

### Code Block Syntax

```asciinema
cast-id: 335480
theme: monokai
speed: 1.5
autoPlay: false
loop: false
```

### Shortcode Syntax

Simple:
```
[asciinema:335480]
```

With options:
```
[asciinema:335480:monokai:1.5]
```

## Configuration Options

- **castId** (required): The Asciinema recording ID or full URL
- **theme**: Player theme (`asciinema`, `monokai`, `solarized-dark`, `solarized-light`)
- **speed**: Playback speed multiplier (default: 1)
- **autoPlay**: Start playing automatically (default: false)
- **loop**: Loop the recording (default: false)
- **cols**: Terminal width in columns
- **rows**: Terminal height in rows

## Implementation Details

The component uses a two-step process:

1. **Server-side**: The `remark-asciinema` plugin transforms markdown syntax into HTML placeholders with data attributes
2. **Client-side**: The `AsciinemaHydrator` component scans for placeholders and replaces them with the actual player

This approach ensures:
- Server-side rendering compatibility
- Progressive enhancement
- Optimal bundle size (player only loaded when needed)

## Error Handling

If the player fails to load, a user-friendly error message is displayed with the cast ID for debugging. The page continues to render normally without breaking.

## Requirements

- Requirements 7.1: Embed Asciinema Player when markdown contains recording reference
- Requirements 7.2: Use recording ID to load correct session
- Requirements 7.4: Apply theme settings matching blog design
