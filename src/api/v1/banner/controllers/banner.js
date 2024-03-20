const bannerData = async (req, res, utility) => {
    const result = await utility?.find({ category: 'banner' }).toArray();
    res.send(result);
}

module.exports = { bannerData };