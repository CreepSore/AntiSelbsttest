let ApplicationLoader = require("./loader/ApplicationLoader");

const main = async function() {
    let app = new ApplicationLoader();
    await app.start();
};

main();
