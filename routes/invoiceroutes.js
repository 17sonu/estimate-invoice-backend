const express = require("express");
const Invoice = require("../model/invoicemodel");

const router = express.Router();

// Create a new invoice (with client details embedded)
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

    // Create new invoice
    const newInvoice = new Invoice({
      client,
      items,
      taxRate,
      dueDate,
      total,
      status,
    });

    await newInvoice.save();
    res.status(201).json(newInvoice);
  } catch (error) {
    res.status(500).json({ message: "Error creating invoice", error });
  }
});

// Get all invoices
router.get("/", async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: "Error fetching invoices", error });
  }
});

// Get total numbers and total amount of sales
router.get("/summary", async (req, res) => {
  try {
    const totalSales = await Invoice.countDocuments();
    const totalSalesAmount = await Invoice.aggregate([
      { $group: { _id: null, totalAmount: { $sum: "$total" } } },
    ]);

    res.status(200).json({
      totalSales,
      totalAmount: totalSalesAmount[0]?.totalAmount || 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching sales summary", error });
  }
});


// Get a single invoice by ID
router.get("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: "Error fetching invoice", error });
  }
});

// Delete an invoice by ID
router.delete("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting invoice", error });
  }
});

module.exports = router;