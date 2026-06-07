#!/bin/sh
set -e

echo "Starting Next.js server..."
echo "PORT: $PORT"
echo "Original HOSTNAME: $HOSTNAME"

# Force HOSTNAME to 0.0.0.0 for Next.js to listen on all interfaces
export HOSTNAME="0.0.0.0"
echo "Set HOSTNAME to: $HOSTNAME"

# Start the server
exec node server.js
