# Use official Node.js LTS image
FROM node:18

# Create app directory inside container
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy rest of the app source code
COPY . .

# Expose port
EXPOSE 3001
EXPOSE 9464

# Start the app
CMD ["node", "index.js"]
