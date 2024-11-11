FROM node:20

WORKDIR /usr/src/app

COPY . .

ENV NODE_ENV production
RUN npm ci

EXPOSE 8080

CMD ["node", "./index.js"]

