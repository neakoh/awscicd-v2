# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Set npm configurations
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false
RUN echo "omit=dev\naudit=false\nloglevel=error" > .npmrc

# Copy package files first to leverage Docker cache
COPY package.json package-lock.json ./

# Install dependencies using cache mount
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production --prefer-offline

# Copy source files
COPY zz/ ./src/
COPY public/ ./public/
COPY server.js ./server.js

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Create non-root user and group
RUN addgroup -S nonroot && \
    adduser -S nonroot -G nonroot

# Copy package files and install production dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy built app and server.js
COPY --from=build /app/build ./build
COPY --from=build /app/server.js ./

# Set correct ownership
RUN chown -R nonroot:nonroot /app

USER nonroot
# Expose port 3000 for the Node.js server
EXPOSE 3000

CMD ["node", "./server.js"]