FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache python3 make g++ && \
    npm install -g esbuild
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && \
    npx esbuild server.ts \
      --platform=node \
      --bundle \
      --outfile=dist-server/server.cjs \
      --format=cjs \
      --external:better-sqlite3 \
      --external:bcryptjs \
      --external:express \
      --external:jsonwebtoken \
      --external:cookie-parser \
      --external:dotenv
RUN mkdir -p /app/data
EXPOSE 3000
CMD ["node", "dist-server/server.cjs"]
