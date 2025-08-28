const { HfInference } = require('@huggingface/inference');
const natural = require('natural');
const nlp = require('node-nlp');
const { Producto, Categoria, Marca } = require('../models');
const { Op } = require('sequelize');
const productFormatter = require('./formatters/productFormatter');

class AIService {
  constructor() {
    // Inicializar Hugging Face (gratuito)
    this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
    
    // Tokenizer para español
    this.tokenizer = new natural.WordTokenizer();
    
    // Clasificador de intenciones
    this.intentClassifier = new nlp.NlpManager({ languages: ['es'] });
    
    // Cache para categorías y marcas (se actualiza automáticamente)
    this.categoriesCache = new Map();
    this.brandsCache = new Map();
    this.lastCacheUpdate = null;
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutos
    
    // Inicializar el servicio
    this.initialized = false;
    this.init();
  }

  async init() {
    try {
      console.log('🚀 Inicializando AIService...');
      
      // Forzar actualización de cache de categorías y marcas
      this.lastCacheUpdate = null; // Forzar actualización
      await this.updateCategoriesAndBrandsCache();
      
      // Entrenar clasificador con intenciones básicas
      await this.trainIntentClassifier();
      this.initialized = true;
      console.log('AIService inicializado correctamente');
    } catch (error) {
      console.error('Error inicializando AIService:', error);
    }
  }

  // Actualizar cache de categorías y marcas automáticamente
  async updateCategoriesAndBrandsCache() {
    try {
      const now = Date.now();
      
      // Solo actualizar si el cache ha expirado
      if (this.lastCacheUpdate && (now - this.lastCacheUpdate) < this.cacheExpiry) {
        console.log('Cache aún válido, no actualizando...');
        return;
      }

      console.log('🔄 Actualizando cache de categorías y marcas...');

      // Obtener todas las categorías (sin filtro de estado ya que no existe)
      const categorias = await Categoria.findAll({
        attributes: ['id', 'nombre']
      });

      console.log('Categorías encontradas en DB:', categorias.map(c => c.nombre));

      // Obtener todas las marcas (sin filtro de estado ya que no existe)
      const marcas = await Marca.findAll({
        attributes: ['id', 'nombre']
      });

      // Limpiar cache anterior
      this.categoriesCache.clear();
      this.brandsCache.clear();

      // Llenar cache con categorías
      categorias.forEach(cat => {
        this.categoriesCache.set(cat.id, cat.nombre.toLowerCase());
        // Agregar sinónimos automáticos
        this.addAutomaticSynonyms(cat.nombre.toLowerCase());
      });

      // Llenar cache con marcas
      marcas.forEach(marca => {
        this.brandsCache.set(marca.id, marca.nombre.toLowerCase());
      });

      this.lastCacheUpdate = now;
      console.log(`✅ Cache actualizado: ${categorias.length} categorías, ${marcas.length} marcas`);
      console.log('Categorías en cache:', Array.from(this.categoriesCache.values()));

    } catch (error) {
      console.error('Error actualizando cache:', error);
    }
  }

  // Agregar sinónimos automáticamente basado en el nombre de la categoría
  addAutomaticSynonyms(categoryName) {
    // DESACTIVAR SINÓNIMOS AUTOMÁTICOS PARA EVITAR DUPLICADOS
    // Los sinónimos están causando problemas con las sugerencias duplicadas
    return;
    
    // Código original comentado:
    /*
    const synonyms = {
      'libros': ['librería', 'lectura', 'texto'],
      'escolares': ['papelería', 'útiles', 'material escolar']
    };

    // Solo agregar sinónimos si la categoría existe en la base de datos
    if (synonyms[categoryName]) {
      synonyms[categoryName].forEach(synonym => {
        // Solo agregar si no existe ya en el cache
        if (!this.categoriesCache.has(synonym)) {
          this.categoriesCache.set(synonym, categoryName);
        }
      });
    }
    */
  }

  // Entrenar clasificador de intenciones
  async trainIntentClassifier() {
    // Intención: Buscar productos
    this.intentClassifier.addDocument('es', 'busco productos de librería', 'buscar_producto');
    this.intentClassifier.addDocument('es', 'necesito material escolar', 'buscar_producto');
    this.intentClassifier.addDocument('es', 'quiero comprar útiles', 'buscar_producto');
    this.intentClassifier.addDocument('es', 'encontrar productos de oficina', 'buscar_producto');
    this.intentClassifier.addDocument('es', 'material de arte', 'buscar_producto');
    this.intentClassifier.addDocument('es', 'papelería', 'buscar_producto');

    // Intención: Consultar precios
    this.intentClassifier.addDocument('es', 'cuánto cuesta', 'consultar_precio');
    this.intentClassifier.addDocument('es', 'precio de', 'consultar_precio');
    this.intentClassifier.addDocument('es', 'valor de', 'consultar_precio');
    this.intentClassifier.addDocument('es', 'costo de', 'consultar_precio');

    // Intención: Horarios
    this.intentClassifier.addDocument('es', 'horarios de atención', 'consultar_horarios');
    this.intentClassifier.addDocument('es', 'cuándo abren', 'consultar_horarios');
    this.intentClassifier.addDocument('es', 'horario de trabajo', 'consultar_horarios');
    this.intentClassifier.addDocument('es', 'días de atención', 'consultar_horarios');

    // Intención: Ubicación
    this.intentClassifier.addDocument('es', 'dónde están ubicados', 'consultar_ubicacion');
    this.intentClassifier.addDocument('es', 'dirección de la tienda', 'consultar_ubicacion');
    this.intentClassifier.addDocument('es', 'ubicación de sucursales', 'consultar_ubicacion');

    // Intención: Ofertas
    this.intentClassifier.addDocument('es', 'ofertas disponibles', 'consultar_ofertas');
    this.intentClassifier.addDocument('es', 'promociones', 'consultar_ofertas');
    this.intentClassifier.addDocument('es', 'descuentos', 'consultar_ofertas');

    // Intención: Contacto
    this.intentClassifier.addDocument('es', 'contactar soporte', 'contactar_soporte');
    this.intentClassifier.addDocument('es', 'hablar con alguien', 'contactar_soporte');
    this.intentClassifier.addDocument('es', 'ayuda humana', 'contactar_soporte');

    // Respuestas para cada intención
    this.intentClassifier.addAnswer('es', 'buscar_producto', 'Te ayudo a encontrar productos. ¿Qué tipo de material necesitas? Tenemos categorías como librería, oficina, arte y regalos.');
    this.intentClassifier.addAnswer('es', 'consultar_precio', 'Los precios varían según el producto. ¿Podrías especificar qué artículo te interesa para darte el precio exacto?');
    this.intentClassifier.addAnswer('es', 'consultar_horarios', 'Estamos disponibles de lunes a viernes de 8:00 a 18:00 y sábados de 9:00 a 17:00.');
    this.intentClassifier.addAnswer('es', 'consultar_ubicacion', 'Tenemos sucursales en Cochabamba y Santa Cruz. ¿En qué ciudad te encuentras?');
    this.intentClassifier.addAnswer('es', 'consultar_ofertas', 'Tenemos ofertas especiales en diferentes categorías. ¿Te interesa alguna categoría específica?');
    this.intentClassifier.addAnswer('es', 'contactar_soporte', 'Puedes contactarnos por WhatsApp al +59172220599 o visitar nuestra página de contacto.');

    // Entrenar el clasificador
    await this.intentClassifier.train();
  }

  // Procesar mensaje del usuario (MEJORADO PARA SUGERENCIAS)
  async processMessage(message, userId = null, context = {}) {
    try {
      // Esperar a que el servicio esté inicializado
      if (!this.initialized) {
        console.log('Esperando inicialización del AIService...');
        await new Promise(resolve => {
          const checkInit = () => {
            if (this.initialized) {
              resolve();
            } else {
              setTimeout(checkInit, 100);
            }
          };
          checkInit();
        });
      }

      // Actualizar cache automáticamente (cada 5 minutos)
      await this.updateCategoriesAndBrandsCache();

      console.log('Procesando mensaje:', message);

      // 1. Si el mensaje es una palabra clave simple (como de sugerencias), procesar directamente
      if (this.isSimpleKeyword(message)) {
        console.log('Mensaje detectado como palabra clave simple');
        const response = await this.handleSimpleKeyword(message);
        return response || 'No pude procesar tu consulta. ¿Podrías ser más específico?';
      }

      // 2. Primero verificar si es una consulta específica de producto
      const specificProduct = await this.handleSpecificProductQuery(message);
      if (specificProduct) {
        return specificProduct;
      }

      // 3. Intentar búsqueda semántica para usuarios no metódicos
      const semanticResult = await this.handleSemanticSearch(message);
      if (semanticResult) {
        return semanticResult;
      }

      // 4. Clasificar intención
      const intentResult = await this.intentClassifier.process('es', message);
      const intent = intentResult.intent;
      const confidence = intentResult.score;

      console.log('Intención detectada:', intent, 'Confianza:', confidence);

      // 5. Si la confianza es baja, usar respuestas inteligentes
      if (confidence < 0.7) {
        return await this.getSmartFallbackResponse(message);
      }

      // 6. Procesar según la intención
      switch (intent) {
        case 'buscar_producto':
          return await this.handleProductSearch(message, context);
        
        case 'consultar_precio':
          return await this.handlePriceQuery(message, context);
        
        case 'consultar_horarios':
          return intentResult.answer;
        
        case 'consultar_ubicacion':
          return intentResult.answer;
        
        case 'consultar_ofertas':
          return await this.handleOffersQuery(context);
        
        case 'contactar_soporte':
          return intentResult.answer;
        
        default:
          return await this.getSmartFallbackResponse(message);
      }

    } catch (error) {
      console.error('Error procesando mensaje:', error);
      return 'Lo siento, no pude procesar tu mensaje. ¿Podrías reformularlo?';
    }
  }

  // Detectar si es una palabra clave simple
  isSimpleKeyword(message) {
    const simpleKeywords = [
      'libros', 'escolares', 'oficina', 'arte', 'regalos', 'ofertas', 
      'horarios', 'ubicacion', 'contacto', 'papelería', 'material'
    ];
    
    const cleanMessage = message.toLowerCase().trim();
    return simpleKeywords.some(keyword => cleanMessage === keyword || cleanMessage.includes(keyword));
  }

  // Manejar palabras clave simples
  async handleSimpleKeyword(keyword) {
    const cleanKeyword = keyword.toLowerCase().trim();
    
    // Mapear palabras clave a acciones específicas
    const keywordMappings = {
      'libros': 'libros',
      'escolares': 'escolares',
      'oficina': 'oficina',
      'arte': 'arte',
      'regalos': 'regalos',
      'papelería': 'escolares',
      'material': 'escolares',
      'ofertas': 'ofertas',
      'horarios': 'horarios',
      'ubicacion': 'ubicacion',
      'contacto': 'contacto'
    };

    const mappedCategory = keywordMappings[cleanKeyword];
    
    if (mappedCategory) {
      if (['ofertas', 'horarios', 'ubicacion', 'contacto'].includes(mappedCategory)) {
        // Manejar consultas de información
        return this.handleInfoQuery(mappedCategory);
      } else {
        // Buscar productos por categoría
        const productos = await this.searchProducts(keyword, [mappedCategory]);
        if (productos.length > 0) {
          return this.formatProductResponse(productos, `Encontré estos productos de ${keyword}:\n\n`);
        } else {
          return `No encontré productos en la categoría "${keyword}". ¿Te refieres a otra categoría?`;
        }
      }
    }
    
    // Si no es una palabra clave reconocida, devolver respuesta de ayuda
    return 'No entiendo esa consulta. ¿Podrías ser más específico? Por ejemplo: "libros", "material escolar", "ofertas", etc.';
  }

  // Manejar consultas de información
  handleInfoQuery(type) {
    const responses = {
      'ofertas': '¡Aquí tienes nuestras ofertas especiales! Tenemos descuentos en diferentes categorías. ¿Te interesa alguna categoría específica?',
      'horarios': 'Estamos disponibles de lunes a viernes de 8:00 a 18:00 y sábados de 9:00 a 17:00.',
      'ubicacion': 'Tenemos sucursales en Cochabamba y Santa Cruz. ¿En qué ciudad te encuentras?',
      'contacto': 'Puedes contactarnos por WhatsApp al +59172220599 o visitar nuestra página de contacto.'
    };
    
    return responses[type] || 'No tengo información sobre eso. ¿Te ayudo con algo más?';
  }

  // Búsqueda avanzada de productos (MEJORADA)
  async handleProductSearch(message, context) {
    try {
      console.log('=== INICIO handleProductSearch ===');
      console.log('Mensaje recibido:', message);
      
      // Extraer categorías mencionadas (ahora dinámicamente)
      const categories = await this.extractCategories(message);
      console.log('Categorías extraídas:', categories);
      
      // Buscar productos
      const productos = await this.searchProducts(message, categories);
      console.log('Productos encontrados:', productos.length);
      
      if (productos.length === 0) {
        console.log('No se encontraron productos, retornando mensaje de error');
        return 'No encontré productos que coincidan con tu búsqueda. ¿Podrías ser más específico?';
      }

      // Si hay muchos productos, usar manejo inteligente
      if (productos.length > 5) {
        console.log('Muchos productos encontrados, usando manejo inteligente');
        return this.handleMultipleProducts(productos, message);
      }

      // Usar el nuevo formato ordenado
      return this.formatProductResponse(productos, 'Encontré estos productos que podrían interesarte:\n\n');
      
      console.log('=== FIN handleProductSearch ===');
      return response;

    } catch (error) {
      console.error('Error en búsqueda de productos:', error);
      return 'Hubo un problema al buscar productos. ¿Podrías intentar de nuevo?';
    }
  }

  // Consulta de precios
  async handlePriceQuery(message, context) {
    try {
      // Extraer productos mencionados
      const productos = await this.extractProducts(message);
      
      if (productos.length === 0) {
        return '¿Podrías especificar qué producto te interesa para darte el precio exacto?';
      }

      return productFormatter.formatPriceResponse(productos);

    } catch (error) {
      console.error('Error consultando precios:', error);
      return 'No pude encontrar información de precios. ¿Podrías ser más específico?';
    }
  }

  // Consulta de ofertas
  async handleOffersQuery(context) {
    try {
      // Buscar productos destacados (por ahora sin descuentos)
      const ofertas = await Producto.findAll({
        where: {
          estado: 'activo'
        },
        include: [
          { model: Categoria, as: 'categoria' },
          { model: Marca, as: 'marca' }
        ],
        limit: 5,
        order: [['created_at', 'DESC']]
      });

      if (ofertas.length === 0) {
        return 'Actualmente no tenemos productos destacados, pero puedes revisar nuestros productos regulares.';
      }

      return productFormatter.formatOffersResponse(ofertas);

      return response;

    } catch (error) {
      console.error('Error consultando ofertas:', error);
      return 'No pude obtener información de productos en este momento.';
    }
  }

  // Extraer categorías del mensaje (AHORA DINÁMICO)
  async extractCategories(message) {
    // Obtener categorías dinámicamente del cache
    const categoriasDisponibles = Array.from(this.categoriesCache.values());
    const mensajeLower = message.toLowerCase();
    
    console.log('Categorías disponibles en cache:', categoriasDisponibles);
    console.log('Mensaje a analizar:', mensajeLower);
    
    const categoriasEncontradas = categoriasDisponibles.filter(categoria => 
      mensajeLower.includes(categoria)
    );
    
    console.log('Categorías encontradas en el mensaje:', categoriasEncontradas);
    
    return categoriasEncontradas;
  }

  // Extraer productos del mensaje
  async extractProducts(message) {
    // Buscar productos que coincidan con el mensaje
    const productos = await Producto.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.iLike]: `%${message}%` } },
          { descripcion: { [Op.iLike]: `%${message}%` } }
        ]
      },
      include: [
        { model: Categoria, as: 'categoria' },
        { model: Marca, as: 'marca' }
      ],
      limit: 3
    });

    return productos;
  }

  // Búsqueda de productos (MEJORADA PARA SUGERENCIAS)
  async searchProducts(query, categories = []) {
    console.log('Buscando productos con query:', query);
    console.log('Categorías a filtrar:', categories);
    
    // Limpiar el query si viene de sugerencias
    const cleanQuery = this.cleanSuggestionMessage(query);
    console.log('Query limpio:', cleanQuery);
    
    let whereClause = {};

    // Si hay categorías específicas, buscar SOLO por categoría
    if (categories.length > 0) {
      const categoryIds = await this.getCategoryIds(categories);
      console.log('IDs de categorías encontrados:', categoryIds);
      whereClause.categoria_id = {
        [Op.in]: categoryIds
      };
    } else {
      // Si no hay categorías, extraer palabras clave del query limpio
      const palabrasClave = this.extractKeywords(cleanQuery);
      console.log('Palabras clave extraídas del query:', palabrasClave);
      
      if (palabrasClave.length > 0) {
        // Buscar por palabras clave individuales
        const whereConditions = palabrasClave.map(palabra => ({
          [Op.or]: [
            { nombre: { [Op.iLike]: `%${palabra}%` } },
            { descripcion: { [Op.iLike]: `%${palabra}%` } }
          ]
        }));
        
        whereClause = {
          [Op.or]: whereConditions
        };
      } else {
        // Fallback: buscar por el query limpio si no se extrajeron palabras clave
        whereClause = {
          [Op.or]: [
            { nombre: { [Op.iLike]: `%${cleanQuery}%` } },
            { descripcion: { [Op.iLike]: `%${cleanQuery}%` } }
          ]
        };
      }
    }

    console.log('WHERE clause final:', JSON.stringify(whereClause, null, 2));

    // Agregar filtro de estado activo
    whereClause.estado = 'activo';

    const productos = await Producto.findAll({
      where: whereClause,
      include: [
        { model: Categoria, as: 'categoria' },
        { model: Marca, as: 'marca' }
      ],
      limit: 10
    });

    console.log(`Productos encontrados: ${productos.length}`);
    if (productos.length > 0) {
      console.log('Primer producto:', productos[0].nombre);
    }

    return productos;
  }

  // Obtener IDs de categorías por nombre (AHORA DINÁMICO)
  async getCategoryIds(categoryNames) {
    // Buscar categorías dinámicamente en la base de datos
    const categorias = await Categoria.findAll({
      where: {
        nombre: {
          [Op.or]: categoryNames.map(name => ({ [Op.iLike]: `%${name}%` }))
        }
      }
    });

    return categorias.map(cat => cat.id);
  }

  // Procesamiento avanzado con Hugging Face
  async processWithAdvancedAI(message, context) {
    try {
      // Usar modelo de Hugging Face para generación de texto
      const response = await this.hf.textGeneration({
        model: 'microsoft/DialoGPT-medium', // Modelo en español
        inputs: `Usuario: ${message}\nAsistente:`,
        parameters: {
          max_length: 100,
          temperature: 0.7,
          do_sample: true
        }
      });

      return response.generated_text || 'No pude generar una respuesta apropiada. ¿Podrías reformular tu pregunta?';

    } catch (error) {
      console.error('Error con Hugging Face:', error);
      
      // Fallback a respuestas predefinidas
      return this.getFallbackResponse(message);
    }
  }

  // Respuesta de fallback
  getFallbackResponse(message) {
    const fallbackResponses = [
      'No estoy seguro de entender. ¿Podrías ser más específico?',
      'No tengo información sobre eso. ¿Te ayudo con algo más?',
      'Puedo ayudarte con búsqueda de productos, precios, horarios y ubicación. ¿Qué necesitas?',
      '¿Te gustaría que te ayude a encontrar productos específicos?'
    ];

    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }

  // Manejar múltiples productos de manera inteligente
  async handleMultipleProducts(productos, query) {
    try {
      // Si hay muchos productos, agruparlos inteligentemente
      if (productos.length > 5) {
        return this.formatGroupedProducts(productos, query);
      } else if (productos.length > 0) {
        return this.formatProductResponse(productos, 'Encontré estos productos:\n\n');
      }
      
      return null;
    } catch (error) {
      console.error('Error manejando múltiples productos:', error);
      return null;
    }
  }

  // Formatear productos agrupados (usando el nuevo formateador)
  formatGroupedProducts(productos, query) {
    return productFormatter.formatGroupedProducts(productos, query);
  }

  // Búsqueda inteligente con filtros
  async intelligentSearch(query, filters = {}) {
    try {
      let whereClause = {
        estado: 'activo'
      };

      // Filtros inteligentes
      if (filters.precioMax) {
        whereClause.precio_l1 = {
          [Op.lte]: filters.precioMax
        };
      }

      if (filters.categoria) {
        whereClause.categoria_id = filters.categoria;
      }

      if (filters.marca) {
        whereClause.marca_id = filters.marca;
      }

      // Búsqueda por texto
      if (query) {
        whereClause[Op.or] = [
          { nombre: { [Op.iLike]: `%${query}%` } },
          { descripcion: { [Op.iLike]: `%${query}%` } }
        ];
      }

      const productos = await Producto.findAll({
        where: whereClause,
        include: [
          { model: Categoria, as: 'categoria' },
          { model: Marca, as: 'marca' }
        ],
        order: [['precio_l1', 'ASC']],
        limit: 20
      });

      return productos;
    } catch (error) {
      console.error('Error en búsqueda inteligente:', error);
      return [];
    }
  }

  // Sugerir productos relacionados
  async suggestRelatedProducts(productoId) {
    try {
      const producto = await Producto.findByPk(productoId, {
        include: [
          { model: Categoria, as: 'categoria' },
          { model: Marca, as: 'marca' }
        ]
      });

      if (!producto) return [];

      // Buscar productos de la misma categoría
      const relacionados = await Producto.findAll({
        where: {
          categoria_id: producto.categoria_id,
          id: { [Op.ne]: productoId },
          estado: 'activo'
        },
        include: [
          { model: Categoria, as: 'categoria' },
          { model: Marca, as: 'marca' }
        ],
        limit: 5
      });

      return relacionados;
    } catch (error) {
      console.error('Error sugiriendo productos relacionados:', error);
      return [];
    }
  }

  // Manejar consultas específicas de productos (MEJORADO PARA SUGERENCIAS)
  async handleSpecificProductQuery(message) {
    try {
      // Limpiar el mensaje si viene de sugerencias
      const cleanMessage = this.cleanSuggestionMessage(message);
      console.log('Mensaje original:', message);
      console.log('Mensaje limpio para búsqueda específica:', cleanMessage);
      
      // Extraer palabras clave del mensaje limpio
      const palabrasClave = this.extractKeywords(cleanMessage);
      console.log('Palabras clave extraídas:', palabrasClave);
      
      if (palabrasClave.length === 0) {
        return null;
      }

      // Buscar productos que coincidan con las palabras clave
      const whereConditions = palabrasClave.map(palabra => ({
        [Op.or]: [
          { nombre: { [Op.iLike]: `%${palabra}%` } },
          { descripcion: { [Op.iLike]: `%${palabra}%` } }
        ]
      }));

      const productos = await Producto.findAll({
        where: {
          [Op.or]: whereConditions
        },
        include: [
          { model: Categoria, as: 'categoria' },
          { model: Marca, as: 'marca' }
        ],
        limit: 15 // Aumentado para manejar múltiples productos
      });

      if (productos.length > 0) {
        // Si hay muchos productos, usar el manejo inteligente
        if (productos.length > 5) {
          return this.handleMultipleProducts(productos, cleanMessage);
        } else {
          return this.formatProductResponse(productos, 'Encontré estos productos que coinciden con tu consulta:\n\n');
        }
      }

      return null; // No se encontraron productos específicos
    } catch (error) {
      console.error('Error en consulta específica de producto:', error);
      return null;
    }
  }

  // Búsqueda semántica para usuarios no metódicos (MEJORADA PARA SUGERENCIAS)
  async handleSemanticSearch(message) {
    try {
      // Limpiar el mensaje de palabras irrelevantes para sugerencias
      const cleanMessage = this.cleanSuggestionMessage(message);
      console.log('Mensaje original:', message);
      console.log('Mensaje limpio:', cleanMessage);
      
      // Mapear consultas vagas a categorías específicas
      const semanticMappings = {
        'escribir': ['libros', 'papelería', 'útiles'],
        'escuela': ['escolares', 'libros', 'útiles'],
        'trabajo': ['oficina', 'papelería'],
        'arte': ['arte', 'manualidades'],
        'regalo': ['regalos', 'souvenirs'],
        'estudiar': ['libros', 'escolares'],
        'dibujar': ['arte', 'manualidades'],
        'manualidades': ['arte', 'manualidades'],
        'oficina': ['oficina', 'papelería'],
        'papel': ['papelería', 'oficina'],
        'lápiz': ['escolares', 'papelería'],
        'cuaderno': ['escolares', 'papelería'],
        'mochila': ['escolares'],
        'calculadora': ['escolares', 'oficina'],
        'marcador': ['oficina', 'escolares'],
        'pegamento': ['escolares', 'manualidades'],
        'tijera': ['escolares', 'manualidades'],
        'pintura': ['arte', 'manualidades'],
        'pincel': ['arte', 'manualidades'],
        'cartulina': ['escolares', 'manualidades'],
        'librería': ['libros', 'escolares'],
        'libros': ['libros', 'escolares'],
        'escolares': ['escolares', 'libros']
      };

      const mensajeLower = cleanMessage.toLowerCase();
      let categoriasEncontradas = [];

      // Buscar coincidencias semánticas
      for (const [palabra, categorias] of Object.entries(semanticMappings)) {
        if (mensajeLower.includes(palabra)) {
          // Filtrar solo las categorías que existen en el cache
          const categoriasDisponibles = Array.from(this.categoriesCache.values());
          const categoriasValidas = categorias.filter(cat => 
            categoriasDisponibles.includes(cat)
          );
          categoriasEncontradas.push(...categoriasValidas);
        }
      }

      console.log('Categorías encontradas en búsqueda semántica:', categoriasEncontradas);

      // Si no encontramos coincidencias semánticas, buscar por palabras clave
      if (categoriasEncontradas.length === 0) {
        const palabrasClave = this.extractKeywords(cleanMessage);
        if (palabrasClave.length > 0) {
          // Buscar productos que contengan esas palabras
          const productos = await Producto.findAll({
            where: {
              [Op.or]: [
                { nombre: { [Op.iLike]: `%${palabrasClave.join('%')}%` } },
                { descripcion: { [Op.iLike]: `%${palabrasClave.join('%')}%` } }
              ]
            },
            include: [
              { model: Categoria, as: 'categoria' },
              { model: Marca, as: 'marca' }
            ],
            limit: 5
          });

          if (productos.length > 0) {
            return this.formatProductResponse(productos, 'Encontré estos productos que podrían servirte:\n\n');
          }
        }
      }

      // Si encontramos categorías semánticas, buscar productos
      if (categoriasEncontradas.length > 0) {
        const productos = await this.searchProducts(cleanMessage, categoriasEncontradas);
        if (productos.length > 0) {
          return this.formatProductResponse(productos, 'Basándome en tu consulta, te sugiero estos productos:\n\n');
        }
      }

      return null;
    } catch (error) {
      console.error('Error en búsqueda semántica:', error);
      return null;
    }
  }

  // Limpiar mensaje de sugerencias para extraer solo palabras relevantes
  cleanSuggestionMessage(message) {
    // Patrones comunes en sugerencias que queremos eliminar
    const patternsToRemove = [
      /^buscar\s+productos\s+de\s+/i,
      /^buscar\s+/i,
      /^productos\s+de\s+/i,
      /^material\s+de\s+/i,
      /^necesito\s+/i,
      /^quiero\s+/i
    ];
    
    let cleanMessage = message;
    
    // Aplicar cada patrón para limpiar el mensaje
    patternsToRemove.forEach(pattern => {
      cleanMessage = cleanMessage.replace(pattern, '');
    });
    
    // Si el mensaje quedó vacío, usar el original
    if (cleanMessage.trim() === '') {
      return message;
    }
    
    return cleanMessage.trim();
  }

  // Formatear respuesta de productos (usando el nuevo formateador)
  formatProductResponse(productos, header) {
    return productFormatter.formatProductResponse(productos, header);
  }

  // Generar sugerencias inteligentes basadas en categorías disponibles
  async generateSmartSuggestions() {
    const suggestions = [];
    
    try {
      // Obtener categorías directamente de la base de datos
      const categorias = await Categoria.findAll({
        attributes: ['id', 'nombre']
      });
      
      console.log('Categorías encontradas para sugerencias:', categorias.map(c => c.nombre));
      
      // Mapear categorías a sugerencias amigables (dinámico)
      const categoryMappings = {
        'libros': 'Libros',
        'escolares': 'Material escolar',
        'oficina': 'Papelería de oficina',
        'arte': 'Arte y manualidades',
        'regalos': 'Regalos y souvenirs',
        'tecnologia': 'Tecnología',
        'deportes': 'Deportes',
        'hogar': 'Hogar y jardín'
      };
      
      // Agregar sugerencias basadas en categorías de la base de datos
      categorias.forEach(categoria => {
        const nombreLower = categoria.nombre.toLowerCase();
        const suggestionText = categoryMappings[nombreLower] || 
                             categoria.nombre.charAt(0).toUpperCase() + categoria.nombre.slice(1);
        
        suggestions.push({
          text: suggestionText,
          category: nombreLower
        });
      });
      
      // Agregar sugerencias generales
      suggestions.push(
        { text: 'Ofertas', category: 'ofertas' },
        { text: 'Horarios', category: 'horarios' },
        { text: 'Ubicación', category: 'ubicacion' },
        { text: 'Contacto', category: 'contacto' }
      );
      
      console.log('Sugerencias generadas:', suggestions.map(s => s.text));
      
    } catch (error) {
      console.error('Error generando sugerencias:', error);
      
      // Fallback a sugerencias básicas si hay error
      suggestions.push(
        { text: 'Libros', category: 'libros' },
        { text: 'Material escolar', category: 'escolares' },
        { text: 'Ofertas', category: 'ofertas' },
        { text: 'Horarios', category: 'horarios' },
        { text: 'Ubicación', category: 'ubicacion' },
        { text: 'Contacto', category: 'contacto' }
      );
    }
    
    return suggestions;
  }

  // Extraer palabras clave del mensaje (MEJORADO PARA SUGERENCIAS)
  extractKeywords(message) {
    // Palabras a ignorar (expandidas para incluir palabras de búsqueda)
    const stopWords = [
      'el', 'de', 'la', 'las', 'los', 'un', 'una', 'unos', 'unas', 'que', 'con', 'por', 'para', 'sin', 'sobre', 'entre', 'detrás', 'delante', 'encima', 'debajo', 'dentro', 'fuera', 'cerca', 'lejos', 'antes', 'después', 'durante', 'hasta', 'desde', 'hacia', 'contra', 'según', 'mediante', 'excepto', 'salvo', 'además', 'también', 'así', 'bien', 'mal', 'muy', 'más', 'menos', 'poco', 'mucho', 'todo', 'nada', 'algo', 'nadie', 'alguien', 'cualquiera', 'cualquier', 'cualesquiera', 'cualesquier', 'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'esos', 'esas', 'aquel', 'aquella', 'aquellos', 'aquellas', 'mío', 'mía', 'míos', 'mías', 'tuyo', 'tuya', 'tuyos', 'tuyas', 'suyo', 'suya', 'suyos', 'suyas', 'nuestro', 'nuestra', 'nuestros', 'nuestras', 'vuestro', 'vuestra', 'vuestros', 'vuestras',
      // Palabras específicas de búsqueda a ignorar
      'buscar', 'busco', 'busca', 'encontrar', 'encontrar', 'necesito', 'necesita', 'quiero', 'quiere', 'productos', 'producto', 'material', 'materiales', 'cosas', 'artículos', 'artículo'
    ];
    
    // Convertir a minúsculas y dividir en palabras
    const palabras = message.toLowerCase().split(/\s+/);
    
    // Filtrar palabras clave (excluir stop words y palabras muy cortas)
    const palabrasClave = palabras.filter(palabra => 
      palabra.length > 2 && 
      !stopWords.includes(palabra) &&
      !palabra.match(/^[0-9]+$/) // Excluir números
    );
    
    console.log('Palabras originales:', palabras);
    console.log('Palabras clave filtradas:', palabrasClave);
    
    return palabrasClave;
  }

  // Análisis de sentimiento
  async analyzeSentiment(message) {
    try {
      const result = await this.hf.textClassification({
        model: 'nlptown/bert-base-multilingual-uncased-sentiment',
        inputs: message
      });

      return {
        sentiment: result[0].label,
        confidence: result[0].score
      };
    } catch (error) {
      console.error('Error analizando sentimiento:', error);
      return { sentiment: 'neutral', confidence: 0.5 };
    }
  }

  // Respuesta inteligente de fallback
  async getSmartFallbackResponse(message) {
    const suggestions = await this.generateSmartSuggestions();
    
    let response = 'Entiendo que buscas algo, pero no estoy seguro de qué específicamente. ';
    response += '¿Te refieres a alguna de estas opciones?\n\n';
    
    suggestions.forEach((suggestion, index) => {
      response += `${index + 1}. ${suggestion.text}\n`;
    });
    
    response += '\nO puedes ser más específico, por ejemplo:\n';
    response += '• "Necesito algo para escribir"\n';
    response += '• "Busco material para la escuela"\n';
    response += '• "Quiero productos de oficina"\n';
    
    return response;
  }
}

module.exports = new AIService(); 