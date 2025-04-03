/**
 * Script para verificar que todas las rutas del backend estén protegidas
 * Ejecución: node scripts/checkRouteProtection.js
 */

const fs = require('fs');
const path = require('path');

// Configuración
const routesDir = path.join(__dirname, '../src/routes');
const ignoredFiles = ['userRoutes.js']; // Archivos que pueden contener rutas públicas
const securityPatterns = [
  'authenticateToken',
  'authMiddleware',
  'checkRole',
  'auth(',
  'isAuth',
  'verifyToken',
  'middleware.auth'
];

console.log('🔍 Verificando protección de rutas...');
console.log('=================================');

// Función principal
const checkFiles = (dir) => {
  try {
    if (!fs.existsSync(dir)) {
      console.error(`❌ El directorio ${dir} no existe`);
      return;
    }

    const files = fs.readdirSync(dir);

    files.forEach(file => {
      // Solo verificar archivos JavaScript
      if (file.endsWith('.js')) {
        const filePath = path.join(dir, file);
        const content = fs.readFileSync(filePath, 'utf8');

        // Verificar si el archivo contiene patrones de seguridad
        const hasSecurityPattern = securityPatterns.some(pattern => content.includes(pattern));

        // Verificar si el archivo está en la lista de ignorados
        const isIgnored = ignoredFiles.includes(file);

        if (!hasSecurityPattern && !isIgnored) {
          console.log(`⚠️  Posible ruta sin protección: ${file}`);

          // Verificar líneas que definen rutas
          const lines = content.split('\n');
          console.log('   Rutas encontradas:');

          let routeCount = 0;
          lines.forEach((line, index) => {
            if ((line.includes('router.') || line.includes('app.')) &&
                /\.(get|post|put|delete|patch)\(/.test(line)) {
              routeCount++;
              console.log(`   [Línea ${index + 1}]: ${line.trim()}`);
            }
          });

          if (routeCount === 0) {
            console.log('   No se encontraron definiciones de rutas');
          }

          console.log('');
        } else if (hasSecurityPattern) {
          console.log(`✅ Ruta protegida: ${file}`);
        } else {
          console.log(`ℹ️ Archivo ignorado: ${file}`);
        }
      }
    });

    console.log('\n=================================');
    console.log('✨ Verificación completada');
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  }
};

// Ejecutar verificación
checkFiles(routesDir);