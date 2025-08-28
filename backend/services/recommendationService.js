const fpgrowth = require('node-fpgrowth');
const { Pedido, DetallePedido, Producto } = require('../models');
const { Op } = require('sequelize');

class RecommendationService {
  async getTransactionData() {
    try {
      // Obtener pedidos completados de los últimos 3 meses
      const fechaLimite = new Date();
      fechaLimite.setMonth(fechaLimite.getMonth() - 3);

      const pedidos = await Pedido.findAll({
        include: [{
          model: DetallePedido,
          include: [Producto]
        }],
        where: {
          estado: 'completado',
          created_at: {
            [Op.gte]: fechaLimite
          }
        }
      });

      // Transformar pedidos en transacciones para el análisis
      return pedidos.map(pedido => 
        pedido.DetallePedidos.map(detalle => detalle.producto_id.toString())
      );
    } catch (error) {
      console.error('Error obteniendo datos de transacciones:', error);
      return [];
    }
  }

  async getFrequentItemsets(productoId) {
    try {
      const transactions = await this.getTransactionData();
      
      if (transactions.length === 0) {
        console.log('No hay transacciones disponibles');
        return [];
      }

      console.log('Analizando transacciones:', transactions.length);

      // Configurar parámetros del algoritmo FP-Growth
      const options = {
        support: 0.01,    // 1% de soporte mínimo
        minLength: 2,     // Mínimo 2 items por conjunto
        maxLength: 4      // Máximo 4 items por conjunto
      };

      // Ejecutar FP-Growth
      const itemsets = await new Promise((resolve, reject) => {
        fpgrowth.mine(transactions, options, (err, itemsets) => {
          if (err) reject(err);
          else resolve(itemsets);
        });
      });

      console.log('Conjuntos frecuentes encontrados:', itemsets.length);

      // Filtrar conjuntos que contengan el producto actual
      const relevantSets = itemsets.filter(itemset => 
        itemset.items.includes(productoId.toString())
      );

      // Extraer productos relacionados
      const relatedProducts = new Set();
      relevantSets.forEach(itemset => {
        itemset.items.forEach(item => {
          if (item !== productoId.toString()) {
            relatedProducts.add(parseInt(item));
          }
        });
      });

      return Array.from(relatedProducts);
    } catch (error) {
      console.error('Error en análisis FP-Growth:', error);
      return [];
    }
  }
}

module.exports = new RecommendationService(); 