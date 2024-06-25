const http = require('http');
const app = require('./app');
const dotenv = require('dotenv');

// Establece el entorno (development por defecto)
const env = process.env.NODE_ENV || 'development';

// Carga las variables de entorno desde el archivo correspondiente
dotenv.config({ path: `.env.${env}` });

// Establece el puerto desde las variables de entorno o usa el 5000 por defecto
const port = process.env.PORT || 5000;

// Crea el servidor HTTP usando la aplicación Express
const server = http.createServer(app);

// Inicia el servidor y escucha en el puerto especificado
server.listen(port, () => {
  console.log(`Server running on port ${port} in ${env} mode`);
});
