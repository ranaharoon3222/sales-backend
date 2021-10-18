"use strict";
// const { sanitizeEntity } = require("strapi-utils");
const _ = require("lodash");
// const { findOne } = require("strapi-connector-bookshelf/lib/relations");
const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

/**
 * Given a dollar amount number, convert it to it's value in cents
 * @param number
 */

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async approve(ctx) {
    const data = ctx.request.body;
    console.log(data);
    let order = await strapi.query("orders").findOne({ id: data.id });
    let entity = await strapi.query("orders").update(
      { id: data.id },
      {
        installments: [
          ...order.installments,
          {
            id: data.i_id,
            invoice: data.invoice,
            status: data.status,
            price: data.price,
          },
        ],
      }
    );

    return sanitizeEntity(entity, { model: strapi.models.orders });
  },

  async installment(ctx) {
    const knex = strapi.connections.default;
    const result = await knex("components_orders_installments")
      .join(
        "orders_components",
        "components_orders_installments.id",
        "=",
        "orders_components.component_id"
      )
      .join("orders", "orders.id", "=", "orders_components.order_id")
      .select(
        "orders.name",
        "orders.id as invoice_no",
        "orders.total_price",
        "components_orders_installments.id",
        "components_orders_installments.invoice",
        "components_orders_installments.status",
        "components_orders_installments.price"
      );

    return _.groupBy(result, "status");
  },

  async create(ctx) {
    const data = ctx.request.body;
    const orderItems = data.order_comp.map(async (item) => {
      const orderedProduct = await strapi
        .query("products")
        .findOne({ id: item.product });

      //  update product stock
      if (orderedProduct.stock <= 0 || orderedProduct.stock < item.quantity) {
        return { error: true };
      } else {
        return { ...orderedProduct, quantity: item.quantity };
      }
    });

    const validData = await strapi.entityValidator.validateEntityCreation(
      strapi.models.orders,
      { ...data }
    );

    const orderPromise = await Promise.all(orderItems);

    try {
      const isStockError = orderPromise.some((stock) => stock.error === true);
      if (!isStockError) {
        //  reduce stock
        orderPromise.forEach((product) => {
          strapi
            .query("products")
            .update(
              { id: product.id },
              { stock: product.stock - product.quantity }
            );
        });
        // end reduce stock

        return await strapi.query("orders").create(validData);
      } else {
        ctx.status = 400;
        return { message: "Stock Not Available" };
      }
    } catch (error) {
      ctx.status = 500;
      return error;
    }
  },
  /**
   * Only send back orders from you
   * @param {*} ctx
   */
  //   async find(ctx) {
  //     const { user } = ctx.state;
  //     let entities;
  //     if (ctx.query._q) {
  //       entities = await strapi.services.orders.search({
  //         ...ctx.query,
  //         user: user.id,
  //       });
  //     } else {
  //       entities = await strapi.services.orders.find({
  //         ...ctx.query,
  //         user: user.id,
  //       });
  //     }
  //     return entities.map((entity) =>
  //       sanitizeEntity(entity, { model: strapi.models.orders })
  //     );
  //   },
  //   /**
  //    * Retrieve an orders by id, only if it belongs to the user
  //    */
  //   async findOne(ctx) {
  //     const { id } = ctx.params;
  //     const { user } = ctx.state;
  //     const entity = await strapi.services.orders.findOne({ id, user: user.id });
  //     return sanitizeEntity(entity, { model: strapi.models.orders });
  //   },
};
