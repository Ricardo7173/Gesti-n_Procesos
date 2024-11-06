let wss;

const setWss = (server) => {
    wss = server;
};

const getWss = () => {
    return wss;
}

module.exports = {
    setWss,
    getWss
};