// src/utils/sendEmail.js

const sendEmail = async (options) => {
    if (process.env.NODE_ENV === 'test') {
      console.log('Mock email sent:', options);
      return Promise.resolve();
    }
    
    // Aquí iría la implementación real del envío de correos
    // Por ahora, solo registramos en consola
    console.log('Email sent:', options);
    return Promise.resolve();
  };
  
  module.exports = sendEmail;