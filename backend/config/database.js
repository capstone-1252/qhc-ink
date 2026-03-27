module.exports = ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');

  if (client === 'sqlite') {
    return {
      connection: {
        client: 'sqlite',
        connection: {
          filename: env('DATABASE_FILENAME', '.tmp/data.db'),
        },
        useNullAsDefault: true,
      },
    };
  }

  // MySQL for production
  const fs = require('fs');
  const path = require('path');
  return {
    connection: {
      client: 'mysql2',
      connection: {
        host: env('DATABASE_HOST'),
        port: env.int('DATABASE_PORT', 25060),
        database: env('DATABASE_NAME'),
        user: env('DATABASE_USERNAME'),
        password: env('DATABASE_PASSWORD'),
        ssl: {
          ca: fs.readFileSync(path.join(__dirname, 'ca-certificate.crt')).toString(),
          rejectUnauthorized: true,
        },
      },
      pool: { min: 2, max: 10 },
    },
  };
};
