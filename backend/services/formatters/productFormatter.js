class ProductFormatter {
  // Formatear respuesta de productos con HTML profesional
  formatProductResponse(productos, header) {
    let response = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 8px 8px 0 0; margin-bottom: 0;">
          <h3 style="margin: 0; font-size: 18px; text-align: center;">${header}</h3>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef;">
          ${this.formatProductsGrid(productos)}
        </div>
      </div>
    `;
    
    return response;
  }

  // Formatear grid de productos
  formatProductsGrid(productos) {
    const groupedProducts = this.groupProductsByCategory(productos);
    
    return Object.entries(groupedProducts).map(([categoria, productosCategoria]) => `
      <div style="margin-bottom: 25px;">
        <div style="background: #2c3e50; color: white; padding: 10px 15px; border-radius: 6px; margin-bottom: 15px;">
          <h4 style="margin: 0; font-size: 16px; display: flex; justify-content: space-between; align-items: center;">
            📚 ${categoria}
            <span style="font-size: 14px; background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 12px;">
              ${productosCategoria.length} producto${productosCategoria.length > 1 ? 's' : ''}
            </span>
          </h4>
        </div>
        
        ${productosCategoria.map(producto => this.formatProductCard(producto)).join('')}
      </div>
    `).join('');
  }

  // Formatear tarjeta de producto individual
  formatProductCard(producto) {
    return `
      <div style="border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; margin-bottom: 10px; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <h5 style="margin: 0; color: #2c3e50; font-size: 16px; flex: 1;">🛍️ ${producto.nombre}</h5>
          <span style="font-weight: bold; color: #27ae60; font-size: 18px; background: #e8f5e8; padding: 4px 8px; border-radius: 4px;">
            Bs. ${producto.precio_l1}
          </span>
        </div>
        
        ${producto.marca?.nombre ? `
          <div style="color: #7f8c8d; font-size: 14px; margin-bottom: 5px;">
            🏷️ <strong>Marca:</strong> ${producto.marca.nombre}
          </div>
        ` : ''}
        
        ${producto.descripcion ? `
          <div style="color: #34495e; font-size: 13px; margin-bottom: 10px; line-height: 1.4;">
            📝 ${producto.descripcion}
          </div>
        ` : ''}
        
        <div style="text-align: center; margin-top: 10px;">
          <a href="/productos/${producto.id}" 
             style="display: inline-block; background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: bold; transition: all 0.3s ease;">
            🔗 Ver detalles completos
          </a>
        </div>
      </div>
    `;
  }

  // Agrupar productos por categoría
  groupProductsByCategory(productos) {
    const groupedProducts = {};
    productos.slice(0, 8).forEach(producto => {
      const categoria = producto.categoria?.nombre || 'Sin categoría';
      if (!groupedProducts[categoria]) {
        groupedProducts[categoria] = [];
      }
      groupedProducts[categoria].push(producto);
    });
    return groupedProducts;
  }

  // Formatear productos agrupados (para múltiples productos)
  formatGroupedProducts(productos, query) {
    const groupedByCategory = {};
    const groupedByBrand = {};
    
    productos.forEach(producto => {
      const categoria = producto.categoria?.nombre || 'Sin categoría';
      const marca = producto.marca?.nombre || 'Sin marca';
      
      if (!groupedByCategory[categoria]) {
        groupedByCategory[categoria] = [];
      }
      if (!groupedByBrand[marca]) {
        groupedByBrand[marca] = [];
      }
      
      groupedByCategory[categoria].push(producto);
      groupedByBrand[marca].push(producto);
    });

    let response = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h3 style="margin: 0; text-align: center; font-size: 20px;">🔍 Resultados de búsqueda</h3>
          <p style="margin: 10px 0 0 0; text-align: center; opacity: 0.9;">"${query}" - ${productos.length} productos encontrados</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef;">
          ${this.formatCategoriesSection(groupedByCategory, productos)}
          ${this.formatBrandsSection(groupedByBrand)}
          ${this.formatNavigationSection(groupedByCategory, productos)}
          ${this.formatSuggestionsSection()}
        </div>
      </div>
    `;

    return response;
  }

  // Formatear sección de categorías
  formatCategoriesSection(groupedByCategory, productos) {
    return `
      <div style="margin-bottom: 25px;">
        <h4 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 8px; margin-bottom: 15px;">
          📚 ORGANIZADO POR CATEGORÍAS
        </h4>
        
        ${Object.entries(groupedByCategory).map(([categoria, productosCategoria]) => `
          <div style="margin-bottom: 20px;">
            <div style="background: #34495e; color: white; padding: 12px 15px; border-radius: 6px; margin-bottom: 10px;">
              <h5 style="margin: 0; font-size: 16px; display: flex; justify-content: space-between; align-items: center;">
                📂 ${categoria.toUpperCase()}
                <span style="font-size: 14px; background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 12px;">
                  ${productosCategoria.length} producto${productosCategoria.length > 1 ? 's' : ''}
                </span>
              </h5>
            </div>
            
            ${productosCategoria.slice(0, 4).map((producto, index) => `
              <div style="border-left: 4px solid #3498db; padding-left: 15px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                  <span style="font-weight: bold; color: #2c3e50;">${index + 1}. ${producto.nombre}</span>
                  <span style="font-weight: bold; color: #27ae60;">Bs. ${producto.precio_l1}</span>
                </div>
                ${producto.marca?.nombre ? `<div style="color: #7f8c8d; font-size: 13px;">🏷️ ${producto.marca.nombre}</div>` : ''}
                ${producto.descripcion ? `<div style="color: #34495e; font-size: 12px; margin-top: 3px;">${producto.descripcion.substring(0, 80)}${producto.descripcion.length > 80 ? '...' : ''}</div>` : ''}
                <a href="/productos/${producto.id}" style="color: #3498db; font-size: 12px; text-decoration: none;">🔗 Ver detalles</a>
              </div>
            `).join('')}
            
            ${productosCategoria.length > 4 ? `
              <div style="text-align: center; color: #7f8c8d; font-style: italic; margin-top: 10px;">
                📋 ... y ${productosCategoria.length - 4} producto${productosCategoria.length - 4 > 1 ? 's' : ''} más
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  // Formatear sección de marcas
  formatBrandsSection(groupedByBrand) {
    const marcasConProductos = Object.entries(groupedByBrand).filter(([marca, productos]) => productos.length > 1);
    
    if (marcasConProductos.length <= 1) return '';
    
    return `
      <div style="margin-bottom: 25px;">
        <h4 style="color: #2c3e50; border-bottom: 2px solid #e74c3c; padding-bottom: 8px; margin-bottom: 15px;">
          🏷️ RESUMEN POR MARCAS
        </h4>
        
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
          ${marcasConProductos.map(([marca, productosMarca]) => `
            <div style="background: white; border: 1px solid #dee2e6; border-radius: 6px; padding: 10px; flex: 1; min-width: 150px; text-align: center;">
              <div style="font-weight: bold; color: #2c3e50; margin-bottom: 5px;">${marca}</div>
              <div style="color: #7f8c8d; font-size: 14px;">${productosMarca.length} producto${productosMarca.length > 1 ? 's' : ''}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Formatear sección de navegación
  formatNavigationSection(groupedByCategory, productos) {
    return `
      <div style="margin-bottom: 25px;">
        <h4 style="color: #2c3e50; border-bottom: 2px solid #f39c12; padding-bottom: 8px; margin-bottom: 15px;">
          🔍 NAVEGACIÓN RÁPIDA
        </h4>
        
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${Object.keys(groupedByCategory).map(categoria => {
            const categoriaId = productos.find(p => p.categoria?.nombre === categoria)?.categoria?.id;
            return categoriaId ? `
              <a href="/productos?categoria=${categoriaId}" 
                 style="display: block; background: linear-gradient(135deg, #f39c12, #e67e22); color: white; padding: 12px 15px; text-decoration: none; border-radius: 6px; font-weight: bold; text-align: center;">
                📂 Ver todos los productos de ${categoria}
              </a>
            ` : '';
          }).join('')}
        </div>
      </div>
    `;
  }

  // Formatear sección de sugerencias
  formatSuggestionsSection() {
    return `
      <div style="background: #e8f4fd; border: 1px solid #bee5eb; border-radius: 6px; padding: 15px;">
        <h4 style="color: #0c5460; margin: 0 0 10px 0; font-size: 16px;">
          💡 SUGERENCIAS PARA REFINAR TU BÚSQUEDA
        </h4>
        
        <div style="display: flex; flex-direction: column; gap: 5px;">
          <div style="color: #0c5460; font-size: 14px;">• 🔍 <strong>Ser más específico:</strong> "libros de matemáticas"</div>
          <div style="color: #0c5460; font-size: 14px;">• 🏷️ <strong>Filtrar por marca:</strong> "productos de Faber"</div>
          <div style="color: #0c5460; font-size: 14px;">• 💰 <strong>Ver por precio:</strong> "productos económicos"</div>
          <div style="color: #0c5460; font-size: 14px;">• 📚 <strong>Buscar por categoría:</strong> "material escolar"</div>
        </div>
      </div>
    `;
  }

  // Formatear información de precios
  formatPriceResponse(productos) {
    let response = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #27ae60, #2ecc71); color: white; padding: 15px; border-radius: 8px 8px 0 0;">
          <h3 style="margin: 0; text-align: center; font-size: 18px;">💰 INFORMACIÓN DE PRECIOS</h3>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef;">
          ${productos.map(producto => `
            <div style="border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; margin-bottom: 10px; background: white;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h4 style="margin: 0; color: #2c3e50; font-size: 16px;">🛍️ ${producto.nombre}</h4>
                <span style="font-weight: bold; color: #27ae60; font-size: 18px;">Bs. ${producto.precio_l1}</span>
              </div>
              
              ${producto.marca?.nombre ? `
                <div style="color: #7f8c8d; font-size: 14px; margin-bottom: 8px;">
                  🏷️ <strong>Marca:</strong> ${producto.marca.nombre}
                </div>
              ` : ''}
              
              <a href="/productos/${producto.id}" 
                 style="display: inline-block; background: #3498db; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: bold;">
                🔗 Ver detalles completos
              </a>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    return response;
  }

  // Formatear productos destacados
  formatOffersResponse(ofertas) {
    let response = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; padding: 15px; border-radius: 8px 8px 0 0;">
          <h3 style="margin: 0; text-align: center; font-size: 18px;">🎉 PRODUCTOS DESTACADOS</h3>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef;">
          ${ofertas.map((producto, index) => `
            <div style="border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; margin-bottom: 10px; background: white; position: relative;">
              <div style="position: absolute; top: -5px; left: -5px; background: #e74c3c; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">
                ${index + 1}
              </div>
              
              <div style="margin-left: 35px;">
                <h4 style="margin: 0 0 8px 0; color: #2c3e50; font-size: 16px;">🛍️ ${producto.nombre}</h4>
                <div style="font-weight: bold; color: #27ae60; font-size: 18px; margin-bottom: 8px;">Bs. ${producto.precio_l1}</div>
                
                ${producto.marca?.nombre ? `
                  <div style="color: #7f8c8d; font-size: 14px; margin-bottom: 5px;">
                    🏷️ <strong>Marca:</strong> ${producto.marca.nombre}
                  </div>
                ` : ''}
                
                ${producto.categoria?.nombre ? `
                  <div style="color: #7f8c8d; font-size: 14px; margin-bottom: 10px;">
                    📂 <strong>Categoría:</strong> ${producto.categoria.nombre}
                  </div>
                ` : ''}
                
                <a href="/productos/${producto.id}" 
                   style="display: inline-block; background: #e74c3c; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: bold;">
                  🔗 Ver detalles
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    return response;
  }
}

module.exports = new ProductFormatter(); 