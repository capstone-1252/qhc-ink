module.exports = {
  beforeCreate(event) {
    if (!event.params.data.menu_category) {
      throw new Error('Menu category is required.');
    }
  },
  beforeUpdate(event) {
    if (event.params.data.menu_category === null) {
      throw new Error('Menu category is required.');
    }
  },
};