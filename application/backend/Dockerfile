# Use the official Node.js image
FROM node:18

# Create non-root user and group
RUN groupadd -r appgroup && \
    useradd -r -g appgroup appuser

# Set the working directory
WORKDIR /app

RUN curl -o /etc/ssl/certs/rds-ca.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

ENV SECRET_ARN=SECRET_ARN
ENV DATABASE_HOST=DATABASE_HOST

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

RUN chown -R appuser:appgroup /app

USER appuser

# Expose the port the app runs on
EXPOSE 4000

# Command to run the application
CMD ["node", "index.js"]