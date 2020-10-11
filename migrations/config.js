module.exports = {
    db: "test",
    driver: "rethinkdbdash",
    pool: true,
    servers: [
        { host: "db", port: 28015 },
    ],
    ssl: false
}