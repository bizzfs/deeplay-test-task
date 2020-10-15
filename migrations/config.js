module.exports = {
    db: process.env.DB_NAME,
    driver: "rethinkdbdash",
    pool: true,
    servers: [
        { host: process.env.DB_HOST , port: +process.env.DB_PORT },
    ],
    ssl: false
};