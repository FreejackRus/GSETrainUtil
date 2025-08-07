# Используем официальный образ Node.js
FROM node:22

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /usr/src/app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN yarn install

# Копируем все файлы проекта в контейнер
COPY . .

# Открываем порт, на котором будет работать приложение
EXPOSE 3000

# Запускаем приложение
CMD [ "yarn", "dev" ]