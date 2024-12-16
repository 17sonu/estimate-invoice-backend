const express = require("express");
const Estimate = require("../model/estimatemodel");

const router = express.Router();

// Create a new estimate (with client details embedded)
router.post("/", async (req, res) => {
  try {
    const { client, items, taxRate, dueDate,status } = req.body;

    // Validate client details
    if (!client?.name || !client?.email) {
      return res.status(400).json({ message: "Client name and email are required." });
    }

    // Calculate totals
    const subTotal = items.reduce(
      (total, item) => total + item.quantity * item.price * (1 - item.discount / 100),
      0
    );
    const vat = (subTotal * taxRate) / 100;
    const total = subTotal + vat;

    // Create new estimate
    const newEstimate = new Estimate({
      client,
      items,
      taxRate,
      dueDate,
      total,
      status,
    });

    await newEstimate.save();
    res.status(201).json(newEstimate);
  } catch (error) {
    res.status(500).json({ message: "Error creating estimate", error });
  }
});

// Get all estimates
router.get("/", async (req, res) => {
  try {
    const estimates = await Estimate.find();
    res.status(200).json(estimates);
  } catch (error) {
    res.status(500).json({ message: "Error fetching estimates", error });
  }
});

// Get total numbers and total amount of estimates
router.get("/summary", async (req, res) => {
  try {
    const totalEstimates = await Estimate.countDocuments();
    const totalEstimateAmount = await Estimate.aggregate([
      { $group: { _id: null, totalAmount: { $sum: "$total" } } },
    ]);

    res.status(200).json({
      totalEstimates,
      totalAmount: totalEstimateAmount[0]?.totalAmount || 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching estimate summary", error });
  }
});


// Get a single estimate by ID
router.get("/:id", async (req, res) => {
  try {
    const estimate = await Estimate.findById(req.params.id);
    if (!estimate) {
      return res.status(404).json({ message: "Estimate not found" });
    }
    res.status(200).json(estimate);
  } catch (error) {
    res.status(500).json({ message: "Error fetching estimate", error });
  }
});


// Delete an estimate by ID
router.delete("/:id", async (req, res) => {
  try {
    const estimate = await Estimate.findByIdAndDelete(req.params.id);
    if (!estimate) {
      return res.status(404).json({ message: "Estimate not found" });
    }
    res.status(200).json({ message: "Estimate deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting estimate", error });
  }
});

module.exports = router;