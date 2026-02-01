FROM node:18-alpine
WORKDIR /app
COPY package.json ./
COPY *.js *.html *.css *.json ./
EXPOSE 8080
CMD ["node", "server.js"]
