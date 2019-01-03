module.exports = (client) => {
    client.on("error", (err) => console.error(err));
};
