export function capitalize(phrase: string) {
    return phrase.replace(/^\w/, function(c) {
        return c.toUpperCase();
    });
}