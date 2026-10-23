const nodemailer = require('nodemailer');

// Ethereal is a fake SMTP service made for testing: nodemailer creates a
// throwaway inbox on the fly (no signup, no credentials) and every email
// sent through it can be viewed at a preview URL instead of a real inbox.
// Swap this file's transporter for a real provider (Gmail, SendGrid, etc.)
// when you're ready to send actual emails - nothing else in the app needs
// to change, since every route only calls sendOrderNotification().
let transporterPromise = null;

function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = nodemailer.createTestAccount().then((testAccount) => {
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
    });
  }
  return transporterPromise;
}

const OWNER_EMAIL = process.env.OWNER_EMAIL || 'owner@ourkart.test';

async function sendOrderNotification(order) {
  try {
    const transporter = await getTransporter();
    const itemLines = order.lines
      .map((l) => `  • ${l.title} × ${l.quantity} — $${(l.price * l.quantity).toFixed(2)}`)
      .join('\n');

    const info = await transporter.sendMail({
      from: '"OurKart Storefront" <orders@ourkart.test>',
      to: OWNER_EMAIL,
      subject: `New Order ${order.orderNumber} — $${order.total.toFixed(2)}`,
      text:
        `A new order has been placed on OurKart.\n\n` +
        `Order: ${order.orderNumber}\n` +
        `Customer: ${order.shipping.fullName}\n` +
        `Ship to: ${order.shipping.address}, ${order.shipping.city}, ${order.shipping.postalCode}, ${order.shipping.country}\n\n` +
        `Items:\n${itemLines}\n\n` +
        `Subtotal: $${order.subtotal.toFixed(2)}\n` +
        `Shipping: $${order.shippingCost.toFixed(2)}\n` +
        `Total: $${order.total.toFixed(2)}`,
    });

    return { sent: true, previewUrl: nodemailer.getTestMessageUrl(info) };
  } catch (err) {
    // Never let a notification failure block an order from completing.
    console.warn('Order notification email could not be sent:', err.message);
    return { sent: false, previewUrl: null };
  }
}

module.exports = { sendOrderNotification };
