# ====================================================
# NexusFlow — Backend Container Specification
# Author: Koneti Manikanth (Backend Lead)
# Organization: Infotact Solutions
# Milestone: Week 1 Deliverable — Container Architecture
# ====================================================

FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source
COPY . .

# Expose backend REST & WebSocket port
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "server.js"]
