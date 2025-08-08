FROM node:22-alpine

WORKDIR /app

# Устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем исходники
COPY . .

# Билдим проект
RUN npm run build

# Устанавливаем serve для раздачи статики
RUN npm install -g serve

# Запускаем билд
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]