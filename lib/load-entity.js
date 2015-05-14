function buildEntity(location) {
  return {
    location: location,
    data: require(location)
  };
}

module.exports = function (location) {
  try {
    return buildEntity(location);
  } catch (e) {
    throw new Error('Failed to load entity: ' + location);
  }
};
