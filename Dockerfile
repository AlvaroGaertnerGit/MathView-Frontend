# Etapa 1: Construcción de Angular
FROM node:18 AS build

WORKDIR /app

# Copiar package.json e instalar dependencias
COPY package.json package-lock.json ./
RUN npm install

# Copiar el código fuente y compilar Angular
COPY . .
RUN npm run build --configuration=production

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar la aplicación Angular compilada a Nginx
COPY --from=build /app/dist/frontend /usr/share/nginx/html

# Exponer el puerto 80 para Nginx
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
