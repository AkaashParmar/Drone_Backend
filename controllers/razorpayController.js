// import Razorpay from "razorpay";
// import crypto from "crypto";
// import Order from "../models/productOrderModel.js";

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });


// export const getRazorpayKey = async (req, res) => {
//   try {
//     res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
//   } catch (err) {
//     console.error("get-razorpay-key error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// export const createOrder = async (req, res) => {
//   try {
//     const { items = [], amount, currency = "INR", receipt } = req.body;
//     if (!amount) return res.status(400).json({ message: "Amount is required" });

//     // Razorpay expects amount in paise
//     const amountInPaise = Math.round(Number(amount) * 100);

//     const options = {
//       amount: amountInPaise,
//       currency,
//       receipt: receipt || `rcpt_${Date.now()}`,
//       payment_capture: 1,
//       notes: {
//         items: JSON.stringify(items.map(i => ({ id: i.productId, qty: i.qty }))),
//       },
//     };

//     const order = await razorpay.orders.create(options);

//     // // save order in DB
//     // const dbOrder = new Order({
//     //   user: req.user._id,
//     //   items: items.map(i => ({
//     //     productId: i.productId,
//     //     name: i.name,
//     //     price: i.price,
//     //     image: i.image,
//     //     qty: i.qty,
//     //   })),
//     //   amount: amountInPaise,
//     //   currency,
//     //   receipt: options.receipt,
//     //   razorpayOrderId: order.id,
//     //   status: "created",
//     //   orderDate: new Date()
//     // });

//     // await dbOrder.save();

//     // res.status(201).json({ order, dbOrderId: dbOrder._id });
//      res.status(201).json({ order });
//   } catch (err) {
//     console.error("createOrder error:", err);
//     res.status(500).json({ message: "Failed to create order", error: err.message });
//   }
// };

// export const verifyPayment = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//     } = req.body;

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return res.status(400).json({ message: "Missing payment fields" });
//     }

//     // ✅ Verify signature
//     const generatedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest("hex");

//     if (generatedSignature !== razorpay_signature) {
//       return res.status(400).json({ success: false, message: "Invalid signature" });
//     }

//     // ✅ Fetch Razorpay order to get real data
//     const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);

//     const items = JSON.parse(razorpayOrder.notes.items || "[]");

//     // ✅ Save in database ONLY after payment success
//     const newOrder = new Order({
//       user: req.user._id,
//       items: items.map(i => ({
//         productId: i.productId,
//         qty: i.qty
//       })),
//       amount: razorpayOrder.amount,
//       currency: razorpayOrder.currency,
//       receipt: razorpayOrder.receipt,
//       razorpayOrderId: razorpay_order_id,
//       razorpayPaymentId: razorpay_payment_id,
//       razorpaySignature: razorpay_signature,
//       status: "paid",
//       orderDate: new Date()
//     });

//     await newOrder.save();

//     return res.status(200).json({
//       success: true,
//       message: "Payment verified successfully",
//       orderId: newOrder._id
//     });

//   } catch (err) {
//     console.error("verifyPayment error:", err);
//     res.status(500).json({ message: "Verification failed", error: err.message });
//   }
// };

// // export const verifyPayment = async (req, res) => {
// //   try {
// //     const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = req.body;
// //     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
// //       return res.status(400).json({ message: "Missing required fields" });
// //     }

// //     // verify signature: hmac_sha256(order_id|payment_id, key_secret)
// //     const generated_signature = crypto
// //       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
// //       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
// //       .digest("hex");

// //     if (generated_signature === razorpay_signature) {
// //       // update DB order
// //       const order = dbOrderId
// //         ? await Order.findById(dbOrderId)
// //         : await Order.findOne({ razorpayOrderId: razorpay_order_id });

// //       if (order) {
// //         order.razorpayPaymentId = razorpay_payment_id;
// //         order.razorpaySignature = razorpay_signature;
// //         order.status = "paid";
// //         await order.save();
// //       }

// //       return res.status(200).json({ success: true, message: "Payment verified" });
// //     } else {
// //       console.warn("Invalid signature", { razorpay_order_id, razorpay_payment_id });
// //       return res.status(400).json({ success: false, message: "Invalid signature" });
// //     }
// //   } catch (err) {
// //     console.error("verifyPayment error:", err);
// //     res.status(500).json({ message: "Verification failed", error: err.message });
// //   }
// // };


// export const webhookHandler = async (req, res) => {
//   try {
//     const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
//     const signature = req.headers["x-razorpay-signature"];

//     const body = req.body;
//     const computedSignature = crypto
//       .createHmac("sha256", webhookSecret)
//       .update(body)
//       .digest("hex");

//     if (computedSignature !== signature) {
//       console.warn("Webhook signature mismatch");
//       return res.status(400).send("Invalid signature");
//     }

//     const payload = JSON.parse(body.toString());
//     const event = payload.event;

//     if (event === "payment.captured") {
//       const payment = payload.payload.payment.entity;
//       // find order by razorpay_order_id and update
//       const order = await Order.findOne({ razorpayOrderId: payment.order_id });
//       if (order) {
//         order.razorpayPaymentId = payment.id;
//         order.status = "paid";
//         await order.save();
//       }
//     } else if (event === "payment.failed") {
//       const payment = payload.payload.payment.entity;
//       const order = await Order.findOne({ razorpayOrderId: payment.order_id });
//       if (order) {
//         order.status = "failed";
//         await order.save();
//       }
//     }
//     // handle other events as needed...

//     // respond quickly
//     res.json({ status: "ok" });
//   } catch (err) {
//     console.error("Webhook handler error:", err);
//     res.status(500).send("Server error");
//   }
// };


// export const getMyOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({ user: req.user._id })
//       .populate({
//         path: "items.productId",
//         model: "Drone",
//         select: "name image category" 
//       })
//       .sort({ createdAt: -1 })
//       .lean();

//     res.status(200).json({
//       success: true,
//       count: orders.length,
//       orders,
//     });

//   } catch (err) {
//     console.error("getMyOrders error:", err);
//     res.status(500).json({ message: "Failed to fetch orders" });
//   }
// };


// export const getOrderById = async (req, res) => {
//   try {
//     const order = await Order.findOne({
//       _id: req.params.id,
//       user: req.user._id,
//     });

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     res.status(200).json({ success: true, order });
//   } catch (err) {
//     console.error("getOrderById error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/productOrderModel.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* =======================================================
   ✅ SEND RAZORPAY KEY TO FRONTEND
======================================================= */
export const getRazorpayKey = async (req, res) => {
  try {
    res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error("getRazorpayKey error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =======================================================
   ✅ CREATE RAZORPAY ORDER (NO DB SAVE HERE)
======================================================= */
export const createOrder = async (req, res) => {
  try {
    const { items = [], amount, currency = "INR", receipt } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const amountInPaise = Math.round(Number(amount) * 100);

    const options = {
      amount: amountInPaise,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1,
      notes: {
        userId: req.user._id.toString(),
        items: JSON.stringify(items),
      },
    };

    const order = await razorpay.orders.create(options);

    res.status(201).json({ order });
  } catch (err) {
    console.error("createOrder error:", err);
    res.status(500).json({ message: "Failed to create Razorpay order", error: err.message });
  }
};

/* =======================================================
   ✅ VERIFY PAYMENT AND SAVE ORDER IN DATABASE
======================================================= */
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment fields" });
    }

    // ✅ Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // ✅ Fetch Razorpay order to get real data
    const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);

    const items = JSON.parse(razorpayOrder.notes.items || "[]");

    // ✅ Save in database ONLY after payment success
    const newOrder = new Order({
      user: req.user._id,
      items: items.map(i => ({
        productId: i.productId,
        qty: i.qty
      })),
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: "paid",
      orderDate: new Date()
    });

    await newOrder.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      orderId: newOrder._id
    });

  } catch (err) {
    console.error("verifyPayment error:", err);
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
};

/* =======================================================
   ✅ RAZORPAY WEBHOOK BACKUP
======================================================= */
export const webhookHandler = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const body = req.body;
    const computedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (computedSignature !== signature) {
      console.warn("Webhook signature mismatch");
      return res.status(400).send("Invalid signature");
    }

    const payload = JSON.parse(body.toString());
    const event = payload.event;

    if (event === "payment.captured") {
      const payment = payload.payload.payment.entity;

      let order = await Order.findOne({ razorpayOrderId: payment.order_id });

      if (!order) {
        // create order if missing (failsafe)
        const razorpayOrder = await razorpay.orders.fetch(payment.order_id);
        const items = JSON.parse(razorpayOrder.notes.items || "[]");

        order = await Order.create({
          user: razorpayOrder.notes.userId,
          items: items,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          receipt: razorpayOrder.receipt,
          razorpayOrderId: payment.order_id,
          razorpayPaymentId: payment.id,
          status: "paid",
          orderDate: new Date()
        });
      } else {
        order.razorpayPaymentId = payment.id;
        order.status = "paid";
        await order.save();
      }
    }

    // ✅ Respond fast
    res.json({ status: "ok" });

  } catch (err) {
    console.error("webhook error:", err);
    res.status(500).send("Webhook Server Error");
  }
};

/* =======================================================
   ✅ MY ORDERS - PAID ONLY
======================================================= */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
      status: "paid"
    })
      .populate({
        path: "items.productId",
        model: "Drone",
        select: "name image category"
      })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (err) {
    console.error("getMyOrders error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

/* =======================================================
   ✅ SINGLE ORDER FETCH
======================================================= */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("getOrderById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

