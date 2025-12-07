async function withTimeout(promise, ms, timeoutMessage = "Timeout") {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(timeoutMessage)), ms)
        )
    ]);
}

module.exports = { withTimeout };