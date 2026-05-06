const Build = require('./buildModel');

// @desc    Create a new build
// @route   POST /api/builds
// @access  Private
const createBuild = async (req, res, next) => {
  try {
    const { title, description, stats, equipment, isPublic } = req.body;

    if (!title) {
      res.status(400);
      throw new Error('Please provide a title for your build');
    }

    const build = await Build.create({
      authorId: req.user.id,
      title,
      description,
      stats,
      equipment,
      isPublic: isPublic !== undefined ? isPublic : false // Default to false so it doesn't auto-publish
    });

    res.status(201).json(build);
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user's personal builds (Dashboard Ledger)
// @route   GET /api/builds
// @access  Private
const getBuilds = async (req, res, next) => {
  try {
    // ONLY fetch builds that belong to the logged-in user
    const builds = await Build.find({ authorId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(builds);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all public builds (The Tavern Community Feed)
// @route   GET /api/builds/community
// @access  Private or Public
const getCommunityBuilds = async (req, res, next) => {
  try {
    // Find all public builds and populate the author's username
    const builds = await Build.find({ isPublic: true })
      .populate('authorId', 'username')
      .sort({ createdAt: -1 }); 

    res.status(200).json(builds);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single build by ID
// @route   GET /api/builds/:id
// @access  Public
const getBuildById = async (req, res, next) => {
  try {
    const build = await Build.findById(req.params.id).populate('authorId', 'username');
    
    if (!build) {
      res.status(404);
      throw new Error('Build not found');
    }
    
    res.status(200).json(build);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a build (e.g., Publishing to Tavern)
// @route   PUT /api/builds/:id
// @access  Private
const updateBuild = async (req, res, next) => {
  try {
    const build = await Build.findById(req.params.id);

    if (!build) {
      res.status(404);
      throw new Error('Build not found');
    }

    if (build.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(401);
      throw new Error('Not authorized to update this build');
    }

    const updatedBuild = await Build.findByIdAndUpdate(
      req.params.id,
      req.body,
      // THE FIX for the Mongoose warning:
      { returnDocument: 'after', runValidators: true } 
    );

    res.status(200).json(updatedBuild);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a build
// @route   DELETE /api/builds/:id
// @access  Private
const deleteBuild = async (req, res, next) => {
  try {
    const build = await Build.findById(req.params.id);

    if (!build) {
      res.status(404);
      throw new Error('Build not found');
    }

    if (build.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(401);
      throw new Error('Not authorized to delete this build');
    }

    await build.deleteOne();

    res.status(200).json({ id: req.params.id, message: 'Build deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBuild,
  getBuilds,
  getCommunityBuilds, // Export the new function!
  getBuildById,
  updateBuild,
  deleteBuild
};