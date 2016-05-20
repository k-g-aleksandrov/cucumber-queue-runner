FROM node:latest

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install

COPY ./src /usr/src/app

EXPOSE 8080

ENV NODE_PATH .

CMD [ "npm", "start" ]