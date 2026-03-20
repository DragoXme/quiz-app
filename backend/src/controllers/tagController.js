const {
    searchTags,
    findTagByName,
    createTag,
    getAllTagsForUser
} = require('../models/tagModel');

const search = async (req, res, next) => {
    try {
        const { query } = req.query;

        if (!query || query.trim() === '') {
            return res.status(200).json({ tags: [] });
        }

        const tags = await searchTags(query.trim());
        res.status(200).json({ tags });
    } catch (error) {
        next(error);
    }
};

const getAll = async (req, res, next) => {
    try {
        const tags = await getAllTagsForUser(req.user.id);
        res.status(200).json({ tags });
    } catch (error) {
        next(error);
    }
};

const createNewTag = async (req, res, next) => {
    try {
        const { name } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Tag name is required.' });
        }

        const normalizedName = name.toLowerCase().trim();
        const existingTag = await findTagByName(normalizedName);
        if (existingTag) {
            return res.status(200).json({
                message: 'Tag already exists.',
                tag: existingTag
            });
        }

        const tag = await createTag(normalizedName);
        res.status(201).json({
            message: 'Tag created successfully.',
            tag
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    search,
    getAll,
    createNewTag
};