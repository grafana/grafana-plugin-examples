FROM node:18

WORKDIR /usr/src/app

COPY . .

ENV NODE_ENV production
RUN npm install

EXPOSE 8080

CMD ["node", "./src/server.js"]
