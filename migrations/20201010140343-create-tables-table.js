'use strict';

let faker = require('faker');

exports.up = function (r, connection) {
  return r
    .tableCreate('tables')
    .run(connection)
    .then(() => {
      const data = [];
      for (let i = 0; i < 100; i++) {
        data[i] = {
          name: faker.commerce.productName(),
        };
      }
      return r.table('tables').insert(data).run(connection);
    });
};

exports.down = function (r, connection) {
  return r.tableDrop('tables').run(connection);
};
