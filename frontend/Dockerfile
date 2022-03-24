FROM node:16.14 as builder


COPY package.json ./
RUN npm install

COPY ./src ./src
COPY ./public ./public
COPY .env ./

RUN npm run build



FROM node:16.14

COPY --from=builder ./build ./build
RUN npm install -g serve

CMD ["serve", "-s", "build"]

