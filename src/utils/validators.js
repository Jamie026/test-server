// src/utils/validators.js
const validatePassword = (password) => {
    const regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.{8,})/;
    return regex.test(password);
  };
  
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  
  module.exports = { validatePassword, validateEmail };