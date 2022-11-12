FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./

COPY controllers/ controllers/

COPY helpers/ helpers/

COPY middleware/ middleware/

COPY models/ models/

COPY public/ public/

COPY routes/ routes/

COPY views/ views/

COPY app.js ./

RUN npm install --omit=dev

USER node

CMD ["npm", "start"]

EXPOSE 8080