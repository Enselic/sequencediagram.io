/**
 * This function was written for v1.x.x where the aim was a solution
 * without a backend and where diagrams were stored in the URL as part
 * of the URL fragment. We should remove this function and instead replace
 * its input with proper JavaScript objects.
 */
export function deserialize(serialized) {
  let objects = [];
  let messages = [];

  serialized.split(';').forEach((o) => {
    if (!o) {
      return;
    }
    let parts = o.split(',');
    if (o[0] === 'o' && parts.length >= 2 && parts[0] && parts[1]) {
      objects.push({
        id: parts[0],
        name: decodeURIComponent(parts[1]),
      });
    } else if (
      o[0] === 'm' &&
      parts.length >= 4 &&
      parts[0] &&
      parts[1] &&
      parts[2] &&
      parts[3]
    ) {
      const isReply = parts[4] && parts[4].indexOf('r') >= 0;
      const isAsync = parts[4] && parts[4].indexOf('a') >= 0;
      messages.push({
        id: parts[0],
        sender: parts[1],
        receiver: parts[2],
        name: decodeURIComponent(parts[3]),
        isReply: isReply ? true : undefined,
        isAsync: isAsync ? true : undefined,
      });
    }
  });

  // Make sure all messages only references objects that were
  // successfully deserialized
  messages = messages.filter((message) => {
    const senderExists = objects.find((object) => object.id === message.sender);
    const receiverExists = objects.find(
      (object) => object.id === message.receiver
    );
    return senderExists && receiverExists;
  });

  return {
    objects,
    messages,
  };
}
