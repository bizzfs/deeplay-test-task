'use strict';

exports.up = function (r, connection) {
  return r.tableCreate('players_tables').run(connection);
};

exports.down = function (r, connection) {
  return r.tableDrop('players_tables').run(connection);
};
