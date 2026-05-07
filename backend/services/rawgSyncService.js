const axios = require('axios');
const Item = require('../models/Item');

const syncWeapons = async () => {
  try {
    const response = await axios.get(
      `https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}`
    );

    const data = response.data.results;

    for (const weapon of data) {
      await Item.findOneAndUpdate(
        {
          externalId: weapon.id,
        },
        {
          name: weapon.name,
          image: weapon.background_image,
          category: 'Weapon',
          source: 'rawg',
        },
        {
          upsert: true,
          new: true,
        }
      );
    }

    console.log('Weapons synced successfully');
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  syncWeapons,
};