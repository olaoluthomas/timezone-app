# Deployment Guide

## Docker Deployment

This section provides detailed instructions for deploying the timezone application using Docker.

### Quick Start with Docker

#### Pull and run pre-built image
```bash
docker pull ghcr.io/olaoluthomas/timezone-app:latest
docker run -d -p 3000:3000 --name timezone-app ghcr.io/olaoluthomas/timezone-app:latest
```

#### Build and run locally
```bash
# Build image
docker build -t timezone-app .

# Run container
docker run -d -p 3000:3000 --name timezone-app timezone-app

# View logs
docker logs -f timezone-app

# Stop container
docker stop timezone-app
```

#### Using Docker Compose

**Production mode:**
```bash
docker-compose up -d
```

**Development mode (with hot-reload):**
```bash
docker-compose --profile dev up timezone-app-dev
```

### Environment Variables

| Variable | Default | Description |
|---------|---------|-------------|
| `PORT` | 3000 | Server port |
| `NODE_ENV` | production | Environment mode (development/production) |
| `LOG_LEVEL` | info | Logging verbosity (debug/info/warn/error) |
| `ALLOWED_ORIGINS` | (empty) | CORS whitelist (comma-separated, production only) |
| `GEOLOCATION_API_KEY` | (unset) | Optional ipapi.co paid-tier API key; omit to use free tier |

### Health Checks

The container includes built-in health checks:

- **Liveness**: `GET /health` (checks if app is running)
- **Readiness**: `GET /health/ready` (checks if app and dependencies are ready)

### Kubernetes Deployment

See `docs/ARCHITECTURE.md` for Kubernetes manifests with liveness/readiness probes.

**Example manifest:**
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health/ready
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 15
```

### Image Details

- **Base Image**: `node:20-alpine`
- **Image Size**: ~150MB (production)
- **User**: Non-root (nodejs:1001)
- **Platforms**: linux/amd64, linux/arm64
- **Registry**: GitHub Container Registry (ghcr.io)

## Deployment Workflow

1. **Build the image** using Docker:
   ```bash
docker build -t timezone-app .
   ```

2. **Run the container**:
   - For production: `docker run -d -p 3000:3000 --name timezone-app timezone-app`
   - For development: `docker-compose up -d`

3. **Verify deployment**:
   - Access the application at `http://localhost:3000`
   - Check health endpoints:
     - `GET /health` (should return `200 OK`)
     - `GET /health/ready` (should return `200 OK`)

4. **Monitor logs**:
   - View container logs: `docker logs -f timezone-app`
   - Check for any errors or warnings

## Production Considerations

- **Scaling**: Use Kubernetes or Docker Swarm for horizontal scaling
- **Backup**: Regularly back up application data and configuration
- **Security**: Ensure proper firewall rules and network security
- **Monitoring**: Implement application monitoring and alerting
- **Updates**: Follow the update process in `docs/PLANNING.md` for new features