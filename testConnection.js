const { sequelize } = require('./src/config/dbConfig');


async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message);
  }
}

testConnection();
