FROM node:20.10-alpine

WORKDIR /usr/app

RUN npm install --global pm2

COPY ./package*.json ./

# Install dependencies
RUN npm install

# Change ownership to the non-root user
RUN chown -R node:node /usr/app

# Copy all files
COPY ./ ./

# Build app
RUN npm run build

EXPOSE 3000

USER node

# Launch app with PM2
CMD [ "npm", "run", "start"]