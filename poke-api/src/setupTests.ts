
import '@testing-library/jest-dom';

// Mock scrollTo para evitar errores de jsdom
window.scrollTo = jest.fn();

window.scrollTo = jest.fn(); // evita errores en pruebas
