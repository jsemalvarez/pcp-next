#!/bin/sh
# Genera la conexión a Postgres a partir de las variables del compose,
# así pgAdmin queda listo al abrirlo sin configurar nada a mano.
set -e

cat > /tmp/pgpass <<EOF
postgres:5432:*:${POSTGRES_USER}:${POSTGRES_PASSWORD}
EOF
chmod 600 /tmp/pgpass

cat > /tmp/servers.json <<EOF
{
  "Servers": {
    "1": {
      "Name": "PCP local",
      "Group": "Servers",
      "Host": "postgres",
      "Port": 5432,
      "MaintenanceDB": "${POSTGRES_DB}",
      "Username": "${POSTGRES_USER}",
      "PassFile": "/tmp/pgpass",
      "SSLMode": "prefer"
    }
  }
}
EOF

# pgAdmin importa este archivo solo la primera vez que arranca
export PGADMIN_SERVER_JSON_FILE=/tmp/servers.json
exec /entrypoint.sh
