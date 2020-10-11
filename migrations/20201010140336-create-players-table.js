'use strict';

let faker = require('faker');

exports.up = function (r, connection) {
  return r
    .tableCreate('players')
    .run(connection)
    .then(() => {
      const data = [];
      for (let i = 0; i < 100; i++) {
        data[i] = {
          first_name: faker.name.firstName(undefined),
          last_name: faker.name.lastName(undefined),
          display_name: faker.internet.userName(),
        };
      }
      return r.table('players').insert(data).run(connection);
    });
};

exports.down = function (r, connection) {
  return r.tableDrop('players').run(connection);
};
