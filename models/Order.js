const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: { type: String },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  promoCode: { type: String },
  discountAmount: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['COD', 'Card', 'Koko', 'Bank'], default: 'COD' },
  billingDetails: {
    firstName: String,
    lastName: String,
    address: String,
    city: String,
    zip: String,
    phone: String,
    orderNotes: String
  },
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
