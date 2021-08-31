module.exports = {
    apps: [
        {
            name: "kzd",
            script: "./server.js",
            watch: true,
            env: {
                "NODE_ENV": "production",
            }
        }
    ]
}