// src/server.js

const express = require('express');
const app = require('./app'); // Asegúrate de que el archivo app.js esté en la ruta correcta
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
