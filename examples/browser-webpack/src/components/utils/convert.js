const uint8ArrayConcat = require('uint8arrays/concat')

const fileContentToDataUri = async (fileContent) => {
  const all = await concatAsyncIterable(fileContent);
  return binaryStringToDataUri(uint8ArrayToBinaryString(all));
};

const concatAsyncIterable = async (ai) => {
  const content = [];
  for await (const chunk of ai) {
    content.push(chunk);
  }

  return uint8ArrayConcat(content);
};

const uint8ArrayToBinaryString = (u8) =>
  Array.from(u8, (e) => String.fromCharCode(e)).join('');

const binaryStringToDataUri = (bs =>
  'data:application/octet-stream;base64,' + btoa(bs));

module.exports = fileContentToDataUri