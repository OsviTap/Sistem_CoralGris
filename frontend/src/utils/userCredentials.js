export const generateBasicCredentials = (usuario) => {
  // Para clientes, generamos una contraseña predeterminada
  if (usuario.tipo_usuario === 'cliente') {
    // Obtener iniciales del nombre completo
    const iniciales = usuario.nombre
      .split(' ')
      .map(palabra => palabra.charAt(0))
      .join('')
      .toUpperCase();
    
    // Obtener últimos 4 dígitos del NIT/Carnet
    const ultimosDigitos = usuario.ruc ? usuario.ruc.slice(-4) : '';
    
    return {
      username: usuario.email,
      // Formato: Iniciales + . + últimos 4 dígitos del NIT/Carnet
      password: `${iniciales}.${ultimosDigitos}`
    }
  }
  
  // Para otros roles, devolvemos solo el username (email)
  return {
    username: usuario.email,
    password: usuario.password // La contraseña actual del usuario
  }
} 