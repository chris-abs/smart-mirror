FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy application code
COPY . .

# Expose port
EXPOSE 3001

# Start the application
CMD ["yarn", "start"]
