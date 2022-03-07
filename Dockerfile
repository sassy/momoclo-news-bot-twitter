FROM node:17

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
RUN yarn install
COPY . .

CMD [ "yarn", "start" ]