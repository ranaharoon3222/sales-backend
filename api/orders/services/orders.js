"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  //   async create(data) {
  //     const orderItems = data.order_comp.map(async (item) => {
  //       const orderedProduct = await strapi
  //         .query("products")
  //         .findOne({ id: item.product });
  //       //  update product stock
  //       if (orderedProduct.stock <= 0) {
  //         return { error: true };
  //       } else {
  //         return { ...orderedProduct, quantity: item.quantity };
  //       }
  //     });
  //     const validData = await strapi.entityValidator.validateEntityCreation(
  //       strapi.models.orders,
  //       { ...data }
  //     );
  //     const orderPromise = await Promise.all(orderItems);
  //     try {
  //       const isStockError = orderPromise.some((stock) => stock.error === true);
  //       if (!isStockError) {
  //         //  reduce stock
  //         orderPromise.forEach((product) => {
  //           strapi
  //             .query("products")
  //             .update(
  //               { id: product.id },
  //               { stock: product.stock - product.quantity }
  //             );
  //         });
  //         // end reduce stock
  //         return await strapi.query("orders").create(validData);
  //       } else {
  //         return { error: "Stock Not Available" };
  //       }
  //     } catch (error) {
  //       return error;
  //     }
  //   },
};
