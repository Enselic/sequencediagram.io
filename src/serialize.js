export function serialize(components) {
    return serializeComponents(components);
}

function serializeObject(object) {
    return object.key + ',' + encodeURIComponent(object.name);
}

function serializeMessage(message) {
    let res = message.key + ',' + message.start + ',' + message.end + ',' + encodeURIComponent(message.name);
    if (message.isReply) {
        res += ',r';
    }
    return res;
}

function serializeComponents(components) {
    return components.reduce((acc, component) => {
        let serializedComponent;
        if (component.key[0] === 'o') {
            serializedComponent = serializeObject(component);
        } else if (component.key[0] === 'm') {
            serializedComponent = serializeMessage(component);
        }
        return acc + (acc ? ';' : '') + serializedComponent
    }, '');
}

function parseKey(key) {
    return key;
}

export function deserialize(serialized) {
    let objects = [];
    let messages = [];

    serialized.split(';').forEach(o => {
        if (!o) {
            return;
        }
        let parts = o.split(',');
        if (o[0] === 'o' && parts.length >= 2 &&
            parts[0] && parts[1]) {
            objects.push({
                key: parseKey(parts[0]),
                name: decodeURIComponent(parts[1]),
            });
        } else if (o[0] === 'm' && parts.length >= 4 &&
            parts[0] && parts[1] && parts[2] && parts[3]) {
            const isReply = parts[4] && parts[4].indexOf('r') >= 0;
            messages.push({
                key: parseKey(parts[0]),
                start: parts[1],
                end: parts[2],
                name: decodeURIComponent(parts[3]),
                isReply: isReply ? true : undefined,
            });
        }
    });

    return {
        objects,
        messages,
    };
}
