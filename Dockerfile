# atlantique-ui/Dockerfile
FROM node:22 AS build

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN npm run build -- --base-href=/atlantique/

FROM nginx:1.25-alpine

COPY --from=build /app/dist/atlantique-ui/browser /usr/share/nginx/html/atlantique

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
