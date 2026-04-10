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
  } catch (err) {
    res.status(500).json(err);
  }
});

// --- CHECKOUT & ORDERS ---

router.post('/checkout', async (req, res) => {
  const { userEmail, userName, products, totalAmount, promoCode, discountAmount, paymentMethod, billingDetails } = req.body;
  
  try {
    const finalAmount = totalAmount - (discountAmount || 0);

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
      status: (paymentMethod === 'Koko') ? 'Paid' : 'Pending'
    });
    const savedOrder = await newOrder.save();

    // 2. Decrement Stock for each product
    for (const item of products) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }

    let payhereHash = null;
    let merchantId = process.env.PAYHERE_MERCHANT_ID || '1228490';
    
    if (paymentMethod === 'Card') {
        const crypto = require('crypto');
        const merchantSecret = process.env.PAYHERE_SECRET || 'MzI1MjA3NTM1NzM4MTMyNzAyMTQxNjIzNDk5MzEzMjAzNjIwODYwNA==';
        const orderId = savedOrder._id.toString();
        const amount = parseFloat(finalAmount).toFixed(2);
        const currency = 'LKR';
        const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
        const hashString = merchantId + orderId + amount + currency + hashedSecret;
        payhereHash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();
    }

    res.status(200).json({ order: savedOrder, payhereHash, merchantId });
  } catch (err) {
    console.error("Checkout Error:", err);
    res.status(500).json(err);
  }
});

router.post('/payhere/notify', async (req, res) => {
    const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig } = req.body;

    try {
        const crypto = require('crypto');
        const merchantSecret = process.env.PAYHERE_SECRET || 'MzI1MjA3NTM1NzM4MTMyNzAyMTQxNjIzNDk5MzEzMjAzNjIwODYwNA==';
        const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
        
        const localMd5sig = crypto.createHash('md5').update(
            merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret
        ).digest('hex').toUpperCase();

        if (localMd5sig === md5sig && status_code == 2) {
            await Order.findByIdAndUpdate(order_id, { status: 'Paid' });
        }
    } catch (err) {
        console.error("PayHere notify processing error:", err);
    }
    
    // Always respond 200 to PayHere webhook so they don't retry unnecessarily
    res.status(200).send();
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
