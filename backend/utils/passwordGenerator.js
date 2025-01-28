function generateUsername(empresa, nombre) {
  // Limpiar y convertir a minúsculas
  const empresaClean = empresa
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Eliminar caracteres especiales
    .slice(0, 5); // Tomar primeros 5 caracteres

  // Tomar primera letra del nombre
  const inicialNombre = nombre
    .toLowerCase()
    .charAt(0);

  // Agregar 2 números aleatorios
  const numeros = Math.floor(Math.random() * 90 + 10);

  return `${empresaClean}${inicialNombre}${numeros}`;
}

function generateSimplePassword() {
  // Lista de palabras comunes en español
  const palabras = [
    'sol', 'luz', 'mar', 'paz', 'dia', 'rey', 'don', 'sur',
    'oro', 'rio', 'pan', 'sal', 'luna', 'vida', 'rosa', 'azul'
  ];

  // Lista de números simples
  const numeros = ['123', '234', '345', '456', '567', '678', '789', '890'];

  // Seleccionar aleatoriamente
  const palabra = palabras[Math.floor(Math.random() * palabras.length)];
  const numero = numeros[Math.floor(Math.random() * numeros.length)];

  // Combinar palabra con números
  return `${palabra}${numero}`;
}

function generateCredentials(empresa, nombre) {
  return {
    username: generateUsername(empresa, nombre),
    password: generateSimplePassword()
  };
}

module.exports = { 
  generateCredentials,
  generateUsername,
  generateSimplePassword
}; 