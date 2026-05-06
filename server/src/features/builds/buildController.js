const Build = require('./buildModel');

// @desc    Create a new build
// @route   POST /api/builds
// @access  Private (Requires Token)
const createBuild = async (req, res, next) => {
  try {
    const { title, description, stats, equipment, isPublic } = req.body;

    if (!title) {
      res.status(400);
      throw new Error('Please provide a title for your build');
    }

    // Create the build, attaching the user ID from our protect middleware
    const build = await Build.create({
      authorId: req.user.id,
      title,
      description,
      stats,
      equipment,
      isPublic
    });

    res.status(201).json(build);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all public builds (for the community feed later)
// @route   GET /api/builds
// @access  Public
const getBuilds = async (req, res, next) => {
  try {
    // Find all public builds and populate the author's username
    const builds = await Build.find({ isPublic: true })
      .populate('authorId', 'username')
      .sort({ createdAt: -1 }); // Newest first

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

// @desc    Update a build
// @route   PUT /api/builds/:id
// @access  Private
const updateBuild = async (req, res, next) => {
  try {
    const build = await Build.findById(req.params.id);

    if (!build) {
      res.status(404);
      throw new Error('Build not found');
    }

    // Security Check: Make sure the logged-in user actually owns this build
    if (build.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(401);
      throw new Error('Not authorized to update this build');
    }

    // Update the build
    const updatedBuild = await Build.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
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

    // Security Check: Make sure the logged-in user actually owns this build
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
  getBuildById,
  updateBuild,
  deleteBuild
};