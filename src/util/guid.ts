export type Guid = `${string}-${string}-${string}-${string}-${string}`;

export function GenerateGuid(): Guid {
    global.crypto = require('crypto');
    // eslint-disable-next-line @typescript-eslint/dot-notation
    return crypto['randomUUID'](); // i hate this workaround
}
