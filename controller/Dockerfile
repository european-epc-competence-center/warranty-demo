FROM node:16.14

COPY package.json ./
RUN npm install
COPY src ./src
COPY public ./public

CMD ["npm", "run", "start"]
