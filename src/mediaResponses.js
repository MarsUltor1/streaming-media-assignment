const fs = require('fs');
const path = require('path');

const loadFile = (request, response, filePath, type) => {
  const file = path.resolve(__dirname, filePath);

  fs.stat(file, (err, stats) => {
    // Handle errors
    if (err) {
      if (err === 'ENOENT') response.writeHead(404);
      return response.end(err);
    }

    // Get file range information
    const { range } = request.headers;
    const positions = range ? range.replace(/bytes=/, '').split('-') : [0];

    const total = stats.size;

    let start = parseInt(positions[0], 10);
    const end = positions[1] ? parseInt(positions[1], 10) : total - 1;
    if (start > end) start = end - 1;

    const chunksize = (end - start) + 1;

    // Write response head
    response.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': type,
    });

    // Stream the file out
    const stream = fs.createReadStream(file, { start, end });

    stream.on('open', () => stream.pipe(response));

    stream.on('error', (streamErr) => response.end(streamErr));

    return stream;
  });
};

const getParty = (request, response) => {
  loadFile(request, response, '../client/party.mp4', 'video/mp4');
};

const getBling = (request, response) => {
  loadFile(request, response, '../client/bling.mp3', 'audio/mpeg');
};

const getBird = (request, response) => {
  loadFile(request, response, '../client/bird.mp4', 'video/mp4');
};

module.exports = {
  getParty,
  getBird,
  getBling,
};
