const http = require('http');

// Equivalent to `fetch()`
async function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (response) => {
      let data = '';
      response.on('data', (d) => {
        data += d;
      });
      response.on('end', () => {
        resolve(JSON.parse(data));
      });
    });
  });
}

module.exports = async (req, res) => {
  const responseBody = await fetch(
    `http://openapi.seoul.go.kr:8088/${process.env.LIBRARY_SEOUL_API_KEY}/json/SeoulPublicLibraryInfo/1/187`
  );
  const row = responseBody.SeoulPublicLibraryInfo.row;
  res.status(200).json(row);
};
