FROM node:lts-alpine

# setup
RUN addgroup -S app && adduser -S -G app app
USER app
WORKDIR /app

# install dependencies
COPY package.json package-lock.json ./
RUN npm ci --production

# copy src
COPY index.js meta-data.js ./
COPY modules/ ./modules/

RUN mkdir data logs
VOLUME [ "/data", "/logs" ]

# run
ENV NODE_ENV=production
CMD ["node", "index.js"]
