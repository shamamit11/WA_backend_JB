# Start from the latest LTS version of Node.js
FROM node:lts

# Create a new directory in our Docker image for our application's code
WORKDIR /app

ENV PUPPETEER_SKIP_DOWNLOAD true

# Copy package.json and yarn.lock to Docker environment
COPY package.json yarn.lock ./

RUN apt update -y && apt install chromium -y

# Install all other dependencies
RUN yarn install

# Copy the rest of the application code to the Docker environment
COPY . .

# Clean the dist directory and build the app
RUN rm -rf dist && yarn build

# Open the application on port 3000
EXPOSE 3002

# Start the application
CMD ["yarn", "start:dev"]
