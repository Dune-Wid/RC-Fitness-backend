const router = require('express').Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const Promotion = require('../models/Promotion');
const jwt = require('jsonwebtoken');

// Security Middleware
const verifyAdmin = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Access Denied');
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (verified.role !== 'admin') return res.status(403).send('Admin Only');
        req.user = verified;
        next();
    } catch (err) { res.status(400).send('Invalid Token'); }
};

// --- PRODUCT ROUTES ---

router.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) { res.status(500).json(err); }
});

router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (err) { res.status(500).json(err); }
});

router.post('/products/add', verifyAdmin, async (req, res) => {
  const newProduct = new Product(req.body);
  try {
    const savedProduct = await newProduct.save();
    res.status(200).json(savedProduct);
  } catch (err) { res.status(500).json(err); }
});

router.delete('/products/delete/:id', verifyAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("Product deleted.");
  } catch (err) { res.status(500).json(err); }
});

router.put('/products/update/:id', verifyAdmin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (err) { res.status(500).json(err); }
});

// --- CHECKOUT & ORDERS ---

router.post('/checkout', async (req, res) => {
  const { 
    userEmail, 
    userName, 
    products, 
    totalAmount, 
    promoCode, 
    discountAmount, 
    paymentMethod, 
    billingDetails,
    receiptImage // Captured from frontend
  } = req.body;
  
  try {
    // 1. Create the Order
    const newOrder = new Order({
      userEmail,
      userName,
      products,
      totalAmount,
      promoCode,
      discountAmount,
      paymentMethod,
      billingDetails,
      receiptImage, // Save receipt if provided
      status: 'Pending' // All COD and Bank orders start as Pending
    });
    const savedOrder = await newOrder.save();

    // 2. Decrement Stock for each product
    for (const item of products) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }

    // Success response - No payment gateway hashes needed
    res.status(200).json({ order: savedOrder });
  } catch (err) {
    console.error("Checkout Error:", err);
    res.status(500).json(err);
  }
});

router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json(err); }
});

router.put('/orders/:id/status', verifyAdmin, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { status: req.body.status } },
      { new: true }
    );
    res.json(updatedOrder);
  } catch (err) { res.status(500).json(err); }
});

// --- PROMOTIONS ---

router.get('/promotions', async (req, res) => {
  try {
    const promos = await Promotion.find();
    res.json(promos);
  } catch (err) { res.status(500).json(err); }
});

router.post('/promotions/add', verifyAdmin, async (req, res) => {
  const newPromo = new Promotion(req.body);
  try {
    const savedPromo = await newPromo.save();
    res.status(200).json(savedPromo);
  } catch (err) { res.status(500).json(err); }
});

router.post('/promotions/validate', async (req, res) => {
  try {
    const promo = await Promotion.findOne({ code: req.body.code, isActive: true });
    if (promo) {
      res.status(200).json(promo);
    } else {
      res.status(404).json("Invalid or expired promo code.");
    }
  } catch (err) { res.status(500).json(err); }
});

router.delete('/promotions/delete/:id', verifyAdmin, async (req, res) => {
  try {
    await Promotion.findByIdAndDelete(req.params.id);
    res.status(200).json("Promotion deleted.");
  } catch (err) { res.status(500).json(err); }
});

router.put('/promotions/toggle/:id', verifyAdmin, async (req, res) => {
  try {
    const promo = await Promotion.findById(req.params.id);
    promo.isActive = !promo.isActive;
    await promo.save();
    res.status(200).json(promo);
  } catch (err) { res.status(500).json(err); }
});

module.exports = router;