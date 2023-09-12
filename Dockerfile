FROM node:18.16    

WORKDIR /app

COPY ./package*.json ./

RUN npm install --only-production

COPY . .

RUN npx prisma generate
RUN npx prisma migrate deploy

RUN npm run build

EXPOSE ${PORT}

CMD ["npm", "run", "start:prod"]
