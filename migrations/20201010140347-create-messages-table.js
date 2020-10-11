'use strict';

exports.up = function (r, connection) {
  return r.tableCreate('messages').run(connection);
};

exports.down = function (r, connection) {
  return r.tableDrop('messages').run(connection);
};
