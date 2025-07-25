# GSETrainUtil

настройка backend
```
cd backend
```
```
yarn install
```

создать .env
где mydb - название базы данных(если её нет,то она создасться)
```
DATABASE_URL="postgresql://postgress:1@localhost:5432/mydb?schema=public"
```

```
npx prisma migrate dev --name init
```
```
npx prisma generate
```

настройка frontend

```
cd frontend
```
```
yarn install
```
запуск
```
yarn dev
```