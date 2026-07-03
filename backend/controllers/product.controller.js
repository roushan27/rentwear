
const Product = require('../models/Product.model');
const { getImageUrls } = require('../utils/normalizeImage');

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-5);
};

exports.createProduct = async (req, res) => {
  try {
    const { title, description, category, rentPerDay, securityDeposit } = req.body;

    if (!title || !description || !category || !rentPerDay || !securityDeposit) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const images = getImageUrls(req.files);
    const product = await Product.create({
      title,
      slug: generateSlug(title),
      description,
      category,
      rentPerDay,
      securityDeposit,
      images,
      approvalStatus: 'approved',
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.listUserItem = async (req, res) => {
  try {
    const { title, description, category, rentPerDay, securityDeposit, address, lat, lng } = req.body;

    if (!title || !description || !category || !rentPerDay || !securityDeposit) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }
    if (!address) {
      return res.status(400).json({ message: 'Please add a pickup location' });
    }

    const images = getImageUrls(req.files);

    const product = await Product.create({
      title,
      slug: generateSlug(title),
      description,
      category,
      rentPerDay,
      securityDeposit,
      images,
      owner: req.user.id,
      location: { address, lat: lat || 0, lng: lng || 0 },
      approvalStatus: 'pending',
      isAvailable: false,
    });

    res.status(201).json({
      message: 'Your item has been submitted for review. It will be listed once approved by admin.',
      product,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort } = req.query;
    let filter = { isAvailable: true, approvalStatus: 'approved' };

    if (search) filter.title = { $regex: search, $options: 'i' };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.rentPerDay = {};
      if (minPrice) filter.rentPerDay.$gte = Number(minPrice);
      if (maxPrice) filter.rentPerDay.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 }; // default: newest
    if (sort === 'price_low') sortOption = { rentPerDay: 1 };
    if (sort === 'price_high') sortOption = { rentPerDay: -1 };

    const products = await Product.find(filter).sort(sortOption);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getMyListings = async (req, res) => {
  try {
    const products = await Product.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getPendingListings = async (req, res) => {
  try {
    const products = await Product.find({ approvalStatus: 'pending' })
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.updateApprovalStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus: status,
        isAvailable: status === 'approved',
      },
      { returnDocument: 'after' }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: `Listing ${status}`, product });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updates = req.body;
    if (req.files && req.files.length > 0) {
      updates.images = getImageUrls(req.files);
    }
    const product = await Product.findByIdAndUpdate(req.params.id, updates, { returnDocument: 'after' });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};