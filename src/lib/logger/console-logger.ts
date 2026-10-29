export const consoleLogger = (...args: unknown[]): void => {
    if (process.env.ENVIRONMENT !== "development") {
        return;
    }
    if (args.length === 0) {
        return;
    }
    try {
        console.error(...args);
    } catch {
        try {
            console.error(
                "consoleLogger failed to log arguments:",
                args,
            );
        } catch {}
    }
};
