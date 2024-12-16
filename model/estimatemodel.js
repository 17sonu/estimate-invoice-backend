const mongoose = require("mongoose");

const EstimateSchema = new mongoose.Schema({
  client: {
    name: { type: String, required: true },
    email: { type: String, required: true },
  },
  items: [
    {
      description: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      discount: { type: Number, default: 0 },
    },
  ],
  taxRate: { type: Number, default: 0 },
  dueDate: { type: Date, required: true },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Paid", "Partially Paid", "Unpaid"], // Define allowed values
    default: "Unpaid",
},
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Estimates", EstimateSchema);