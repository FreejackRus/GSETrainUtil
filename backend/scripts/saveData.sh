#!/bin/bash

# === Настраиваемые переменные ===
PG_USER="postgres"
PG_HOST="localhost"
PG_PORT="5432"
DUMP_DIR="/var/backups"

# === Служебные переменные ===
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")  # новый формат

backup_db() {
    DB_NAME="$1"

    if [ -z "$DB_NAME" ]; then
        echo "❌ Не указано имя базы данных!"
        exit 1
    fi

    DB_DIR="${DUMP_DIR}/${DB_NAME}"
    mkdir -p "$DB_DIR"

    DATE_DIR="${DB_DIR}/${TIMESTAMP}"
    mkdir -p "$DATE_DIR"

    DUMP_FILE="${DATE_DIR}/${DB_NAME}.sql"

    echo "Создаю дамп базы: $DB_NAME → $DUMP_FILE"
    pg_dump -U "$PG_USER" -h "$PG_HOST" -p "$PG_PORT" "$DB_NAME" > "$DUMP_FILE"

    gzip "$DUMP_FILE"
    echo "📦 Файл заархивирован: ${DUMP_FILE}.gz"

    echo "✅ Бэкап базы $DB_NAME сохранён в $DATE_DIR"
}

cleanup_old_backups() {
    DB_NAME="$1"
    MAX_AGE="$2"

    if [ -z "$DB_NAME" ] || [ -z "$MAX_AGE" ]; then
        echo "❌ Не указано имя базы или максимальный возраст!"
        exit 1
    fi

    DB_DIR="${DUMP_DIR}/${DB_NAME}"

    if [ ! -d "$DB_DIR" ]; then
        echo "❌ Папка с бэкапами не найдена: $DB_DIR"
        exit 1
    fi

    echo "🗑 Проверяем папки в $DB_DIR на возраст старше $MAX_AGE..."

    # Переводим max_age в секунды
    case "$MAX_AGE" in
        *m) SECONDS=$(( ${MAX_AGE%m} * 60 )) ;;
        *h) SECONDS=$(( ${MAX_AGE%h} * 3600 )) ;;
        *d) SECONDS=$(( ${MAX_AGE%d} * 86400 )) ;;
        *w) SECONDS=$(( ${MAX_AGE%w} * 604800 )) ;;
        *M) SECONDS=$(( ${MAX_AGE%M} * 2592000 )) ;;
        *) echo "❌ Неверный формат MAX_AGE"; exit 1 ;;
    esac

    NOW=$(date +%s)

    for FOLDER in "$DB_DIR"/*; do
        [ -d "$FOLDER" ] || continue
        BASENAME=$(basename "$FOLDER")

        # Парсим новый формат
        FOLDER_DATE=$(date -d "${BASENAME:0:8} ${BASENAME:9:2}:${BASENAME:11:2}:${BASENAME:13:2}" +%s 2>/dev/null)
        if [ -z "$FOLDER_DATE" ]; then
            echo "⚠ Пропускаем папку с неверной датой: $BASENAME"
            continue
        fi

        AGE=$(( NOW - FOLDER_DATE ))
        if [ $AGE -gt $SECONDS ]; then
            echo "Удаляем старую папку: $FOLDER"
            rm -rf "$FOLDER"
        fi
    done

    echo "✅ Очистка старых бэкапов завершена."
}
restore_db() {
    DUMP_PATH="$1"
    DB_NAME="$2"

    if [ -z "$DUMP_PATH" ] || [ -z "$DB_NAME" ]; then
        echo "❌ Использование: $0 restore <путь_к_дампу.sql[.gz]> <имя_базы>"
        exit 1
    fi


    echo "🧹 Чищу базу $DB_NAME..."
    sudo -u "$PG_USER" psql -d "$DB_NAME" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

    echo "♻ Восстанавливаю базу $DB_NAME из $DUMP_PATH..."
    if [[ "$DUMP_PATH" == *.gz ]]; then
        gunzip -c "$DUMP_PATH" | sudo -u "$PG_USER" psql -d "$DB_NAME"
    else
        sudo -u "$PG_USER" psql -d "$DB_NAME" < "$DUMP_PATH"
    fi

    if [ $? -eq 0 ]; then
        echo "✅ База $DB_NAME успешно восстановлена!"
    else
        echo "❌ Ошибка при восстановлении базы!"
    fi
}


# === Основная логика ===
case "$1" in
    backup)
        backup_db "$2"
        ;;
    cleanup)
        cleanup_old_backups "$2" "$3"
        ;;
    restore)
        restore_db "$2" "$3"
        ;;
    *)
        echo "Использование:"
        echo "  $0 backup <имя_базы>               # сделать дамп"
        echo "  $0 cleanup <имя_базы> <max_age>    # удалить старые дампы (m,h,d,w,M)"
        echo "  $0 restore <путь_к_дампу> <база>   # восстановить БД из дампа"
        exit 1
        ;;
esac