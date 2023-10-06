# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Expose the port that the Express app will run on (replace 3000 with your desired port)
EXPOSE 3000

# Start the Express app when the container starts
CMD ["node", "server.js"]