const getCategory = async (req, res, utility) => {
    const result = await utility?.find({ category: { $ne: 'banner' } }).toArray();
    res.send(result);
}

module.exports = { getCategory };