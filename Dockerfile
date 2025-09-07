FROM node:24-alpine

COPY . .

ENV NODE_ENV=production
RUN npm ci; 
RUN npm run build
RUN ls -lR
COPY .prod.env ./.env

COPY /public ./public

RUN cp -R .next/standalone/. ./

RUN chmod -R a-w+x . && chmod -R a+x .next node_modules

EXPOSE 3000

CMD ["node", "server.js"]