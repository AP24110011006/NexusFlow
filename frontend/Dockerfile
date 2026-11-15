# ====================================================
# NexusFlow — Frontend Multi-Stage Container Build
# Author: Likhitha (Frontend Lead)
# Organization: Infotact Solutions
# Milestone: Week 1 Deliverable — Frontend Containerization
# ====================================================

# Step 1: Build the Vite production bundle
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Step 2: Serve via Nginx
FROM nginx:alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
