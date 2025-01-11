const { exec } = require('child_process');
const moment = require('moment');

const backupDatabase = () => {
  const timestamp = moment().format('YYYY-MM-DD_HH-mm');
  const filename = `backup_${timestamp}.sql`;
  
  exec(`pg_dump ${process.env.DATABASE_URL} > backups/${filename}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error en backup: ${error}`);
      return;
    }
    console.log(`Backup creado: ${filename}`);
  });
};

module.exports = backupDatabase;