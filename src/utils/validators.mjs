export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email) => emailRegex.test(email);

export const isValidPassword = (password) => password.length >= 6;

export const isValidName = (name) => name.trim().length >= 3;
