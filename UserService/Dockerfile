FROM node:18.17.0

WORKDIR /app

COPY package.json package-lock.json ./

# Update npm to the latest version
RUN npm install -g npm@10.8.1

# Install dependencies, ensuring native modules are built in the container
RUN npm install

RUN npm install pm2 -g

COPY . .

# Ensure node_modules are not overwritten
RUN rm -rf node_modules && npm install

EXPOSE 8004

CMD ["pm2-runtime", "index.js"]

