const axios = require('axios');

let metaData = {};

const fetchMetaData = async () => {
  try {
    const { data } = await axios.get('https://metadata.luckperms.net/data/all');
    const { data: translations } = await axios.get(
      'https://metadata.luckperms.net/data/translations'
    );
    metaData = { ...data, translations };
  } catch (e) {
    console.error(e);
  }
};

fetchMetaData();

setInterval(() => {
  fetchMetaData();
}, 60000);

module.exports = () => metaData;
