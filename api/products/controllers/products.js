"use strict";
const { sanitizeEntity } = require("strapi-utils");
const _ = require("lodash");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  build: async (ctx) => {
    const { _id } = ctx.params;
    let product = await strapi.services.products.findOne({ id: _id });

    if (!product.attribute.length) return;

    const cartesian = (sets) => {
      return sets.reduce(
        (acc, curr) => {
          return acc
            .map((x) => {
              return curr.map((y) => {
                return x.concat([y]);
              });
            })
            .flat();
        },
        [[]]
      );
    };

    //capitalize function
    const capitalize = (s) => {
      if (typeof s !== "string") return "";
      return s
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    const { attribute } = product;

    //map functions return an array of array [["sm", "md", "lg"], ["red", "green", "blue"]]
    //cartesian function reduces and combines arrays and returns mixed variations
    //[ [ { size: 'sm' }, { color: 'blue' } ], [ { size: 'sm' }, { color: 'red' } ], [ { size: 'sm' }, { color: 'green' } ], [ { size: 'md' }, { color: 'blue' } ], [ { size: 'md' }, { color: 'red' } ], [ { size: 'md' }, { color: 'green' } ], [ { size: 'lg' }, { color: 'blue' } ], [ { size: 'lg' }, { color: 'red' } ], [ { size: 'lg' }, { color: 'green' } ]]
    const variations = cartesian(
      _.map(attribute, ({ name, items }) =>
        _.map(items, ({ value, description }) => ({
          [name]: value,
          description,
        }))
      )
    );

    //iterate through all variations creating the records
    const records = _.map(variations, (variation) => {
      let name = variation.reduce(
        (acc, current) => acc + " " + Object.values(current)[0],
        product.product_name
      );

      let slug = variation
        .reduce(
          (acc, current) =>
            acc + "-" + Object.values(current)[0].replace(/ /g, "-"),
          product.slug
        )
        .toLowerCase();

      return {
        product: product.id,
        name: capitalize(name),
        slug: slug,
        purchase_price: product.purchase_price,
        description: variation[0].description,
        stock: product.stock,
        price: product.sale_price,
        ...("min_sale_price" in product && { sale: product.min_sale_price }),
      };
    });

    try {
      const createAllRecords = await Promise.all(
        records.map(
          (record) =>
            new Promise(async (resolve, reject) => {
              try {
                const created = await strapi.services.variations.create(record);
                resolve(created);
              } catch (err) {
                reject(err);
              }
            })
        )
      );
      return sanitizeEntity(createAllRecords, {
        model: strapi.models.variations,
      });
    } catch (err) {
      console.log(err);
    }
  },
};
