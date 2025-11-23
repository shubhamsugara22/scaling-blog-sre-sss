# Asciinema Terminal Recording Guide

Asciinema is a tool for recording and sharing terminal sessions. This guide covers how to create recordings and embed them in your blog posts.

## What is Asciinema?

Asciinema records terminal sessions as lightweight text-based recordings (not videos), which means:
- Small file sizes (typically a few KB)
- Searchable and copyable text
- Fast loading and playback
- No video encoding/decoding overhead

## Creating Recordings

### Installation

**macOS:**
```bash
brew install asciinema
```

**Ubuntu/Debian:**
```bash
sudo apt-get install asciinema
```

**Fedora:**
```bash
sudo dnf install asciinema
```

**Using pip:**
```bash
pip3 install asciinema
```

### Recording a Session

1. **Start recording:**
```bash
asciinema rec
```

2. **Perform your commands** in the terminal

3. **Stop recording** by typing `exit` or pressing `Ctrl+D`

4. **Upload to asciinema.org:**
```bash
asciinema upload recording.cast
```

Or record and upload in one step:
```bash
asciinema rec
# ... perform commands ...
# exit
# Choose 'y' to upload
```

### Recording Options

**Set terminal size:**
```bash
asciinema rec --cols 120 --rows 30
```

**Add title:**
```bash
asciinema rec --title "Kubernetes Deployment Demo"
```

**Overwrite existing file:**
```bash
asciinema rec --overwrite demo.cast
```

**Append to existing recording:**
```bash
asciinema rec --append demo.cast
```

**Set idle time limit (skip long pauses):**
```bash
asciinema rec --idle-time-limit 2
```

**Record to file without uploading:**
```bash
asciinema rec demo.cast
```

## Embedding in Blog Posts

Once you have a recording uploaded to asciinema.org, you'll get a URL like:
```
https://asciinema.org/a/335480
```

The recording ID is `335480`.

### Method 1: Shortcode Syntax (Simple)

**Basic embed:**
```markdown
[asciinema:335480]
```

**With theme:**
```markdown
[asciinema:335480:monokai]
```

**With theme and speed:**
```markdown
[asciinema:335480:monokai:1.5]
```

### Method 2: Code Block Syntax (Full Control)

````markdown
```asciinema
cast-id: 335480
theme: monokai
speed: 1.5
autoPlay: false
loop: false
cols: 120
rows: 30
```
````

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `cast-id` | string | **required** | Asciinema recording ID or full URL |
| `theme` | string | `asciinema` | Player theme (see themes below) |
| `speed` | number | `1` | Playback speed multiplier |
| `autoPlay` | boolean | `false` | Start playing automatically |
| `loop` | boolean | `false` | Loop the recording |
| `cols` | number | auto | Terminal width in columns |
| `rows` | number | auto | Terminal height in rows |
| `startAt` | number | `0` | Start playback at specific time (seconds) |
| `preload` | boolean | `false` | Preload the recording |
| `poster` | string | - | Poster frame time (e.g., "npt:0:05") |

## Available Themes

- `asciinema` - Default Asciinema theme (light background)
- `monokai` - Dark theme with vibrant colors
- `solarized-dark` - Solarized dark color scheme
- `solarized-light` - Solarized light color scheme
- `tango` - Tango color scheme
- `nord` - Nord color scheme

### Theme Examples

**Monokai (recommended for dark blogs):**
```markdown
[asciinema:335480:monokai]
```

**Solarized Dark:**
```markdown
[asciinema:335480:solarized-dark]
```

## Best Practices

### 1. Plan Your Recording

Before recording:
- Write a script or outline of commands
- Clean your terminal history: `history -c`
- Set a clean prompt: `export PS1="\$ "`
- Clear the screen: `clear`

### 2. Keep It Focused

- Record one task or concept per recording
- Keep recordings under 5 minutes when possible
- Use `--idle-time-limit` to skip long pauses

### 3. Add Context

Start recordings with context:
```bash
# Recording: Deploying to Kubernetes
# Date: 2024-01-20
# Prerequisites: kubectl configured, cluster running

kubectl get nodes
```

### 4. Use Comments

Add comments to explain what you're doing:
```bash
# First, check current deployments
kubectl get deployments

# Apply the new configuration
kubectl apply -f deployment.yaml

# Verify the rollout
kubectl rollout status deployment/myapp
```

### 5. Clean Up Sensitive Data

Before uploading:
- Remove API keys, tokens, passwords
- Use placeholder values for sensitive data
- Review the recording: `asciinema play recording.cast`

### 6. Optimize Terminal Size

Use a standard size that works well on most screens:
```bash
asciinema rec --cols 100 --rows 30
```

## Common Use Cases

### Kubernetes Deployment

```bash
asciinema rec k8s-deploy.cast --title "Kubernetes Deployment" --idle-time-limit 2

# Show current state
kubectl get pods -n production

# Apply new deployment
kubectl apply -f deployment.yaml

# Watch rollout
kubectl rollout status deployment/myapp -n production

# Verify
kubectl get pods -n production
kubectl logs -n production deployment/myapp --tail=20

exit
```

### Terraform Infrastructure

```bash
asciinema rec terraform-apply.cast --title "Terraform AWS Infrastructure"

# Initialize
terraform init

# Plan changes
terraform plan -out=tfplan

# Apply changes
terraform apply tfplan

# Show outputs
terraform output

exit
```

### Docker Build and Run

```bash
asciinema rec docker-demo.cast --title "Docker Build and Deploy"

# Build image
docker build -t myapp:latest .

# Run container
docker run -d -p 8080:8080 --name myapp myapp:latest

# Check logs
docker logs myapp

# Test endpoint
curl http://localhost:8080/health

exit
```

### Debugging Session

```bash
asciinema rec debug-session.cast --title "Debugging Production Issue"

# Check pod status
kubectl get pods -n production

# Get pod logs
kubectl logs -n production pod-name --tail=50

# Describe pod
kubectl describe pod -n production pod-name

# Check events
kubectl get events -n production --sort-by='.lastTimestamp'

exit
```

## Editing Recordings

### Using asciinema-edit

Install:
```bash
pip3 install asciinema-edit
```

**Cut recording:**
```bash
asciinema-edit cut --start 5 --end 60 input.cast output.cast
```

**Speed up recording:**
```bash
asciinema-edit speed --factor 2 input.cast output.cast
```

**Quantize (normalize timing):**
```bash
asciinema-edit quantize --range 0.1 input.cast output.cast
```

### Manual Editing

Recordings are JSON files that can be edited manually:

```json
{
  "version": 2,
  "width": 80,
  "height": 24,
  "timestamp": 1234567890,
  "env": {
    "SHELL": "/bin/bash",
    "TERM": "xterm-256color"
  }
}
[0.123, "o", "$ "]
[1.234, "o", "echo 'Hello World'\r\n"]
[1.345, "o", "Hello World\r\n"]
```

## Player Controls

When embedded in blog posts, the player provides:

**Mouse controls:**
- Click play/pause button
- Click progress bar to seek
- Hover for controls

**Keyboard shortcuts:**
- `Space` - Play/pause
- `f` - Toggle fullscreen
- `.` - Step forward (when paused)
- `,` - Step backward (when paused)
- `0-9` - Jump to 0%-90% of recording
- `<` - Decrease speed
- `>` - Increase speed

## Troubleshooting

### Recording Not Uploading

1. **Check internet connection**
2. **Verify asciinema.org is accessible**
3. **Try uploading manually:**
```bash
asciinema upload recording.cast
```

### Player Not Loading in Blog

1. **Verify cast ID is correct**
2. **Check that recording is public on asciinema.org**
3. **Ensure JavaScript is enabled**
4. **Check browser console for errors**

### Recording Quality Issues

**Terminal too small:**
```bash
asciinema rec --cols 120 --rows 30
```

**Too many pauses:**
```bash
asciinema rec --idle-time-limit 2
```

**Wrong colors:**
- Use a theme that matches your terminal
- Set `TERM=xterm-256color` before recording

## Privacy and Security

### Before Recording

- [ ] Clear sensitive history: `history -c`
- [ ] Use dummy credentials
- [ ] Avoid showing real IP addresses
- [ ] Don't show API keys or tokens
- [ ] Use placeholder domain names

### Before Uploading

- [ ] Review the recording: `asciinema play recording.cast`
- [ ] Check for sensitive data
- [ ] Verify commands are correct
- [ ] Test playback speed

### Making Recordings Private

By default, recordings are unlisted (not searchable but accessible via URL). To make truly private:

1. Record to file: `asciinema rec demo.cast`
2. Host on your own server
3. Use the file URL in your blog

## Advanced Tips

### Custom Prompt

Set a clean, informative prompt:
```bash
export PS1="\[\033[01;32m\]\u@demo\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ "
```

### Slow Down Typing

Use `pv` to simulate typing:
```bash
echo "kubectl get pods" | pv -qL 20
```

### Add Pauses

Add deliberate pauses for emphasis:
```bash
kubectl apply -f deployment.yaml
sleep 2
kubectl get pods
```

### Multiple Windows

Use `tmux` or `screen` to show multiple panes:
```bash
tmux new-session -s demo
# Split panes and record
asciinema rec
```

## Resources

- [Asciinema Official Site](https://asciinema.org/)
- [Asciinema Documentation](https://docs.asciinema.org/)
- [Asciinema GitHub](https://github.com/asciinema/asciinema)
- [Asciinema Player](https://github.com/asciinema/asciinema-player)
- [Recording Tips](https://blog.asciinema.org/post/tips-and-tricks/)

## Example Blog Post Usage

See `content/blog/feature-showcase.md` for a complete example of embedding Asciinema recordings in blog posts.

## Quick Reference

**Record and upload:**
```bash
asciinema rec --title "My Demo" --idle-time-limit 2
```

**Embed in blog (simple):**
```markdown
[asciinema:CAST_ID]
```

**Embed with options:**
````markdown
```asciinema
cast-id: CAST_ID
theme: monokai
speed: 1.5
autoPlay: false
```
````

**Test locally:**
```bash
asciinema play recording.cast
```
