FROM node:22 AS build

WORKDIR /app

COPY package.json ./

RUN npm install -g npm@11.5.2

RUN npm install --force

COPY . .

RUN npm run build -- --base-href=/atlantique/ --output-path=dist/atlantique-ui

FROM nginx:1.25-alpine

COPY --from=build /app/dist/atlantique-ui /usr/share/nginx/html/atlantique

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
