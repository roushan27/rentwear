
const wrapper = (title, bodyHtml) => `
  <div style="font-family: 'Georgia', serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #F7F5F1;">
    <h1 style="color: #234D3B; font-size: 22px; margin-bottom: 4px;">RentWear</h1>
    <div style="background: #ffffff; border-radius: 16px; padding: 24px; margin-top: 16px; border: 1px solid #1B1B1F1A;">
      <h2 style="color: #1B1B1F; font-size: 18px; margin-top: 0;">${title}</h2>
      ${bodyHtml}
    </div>
    <p style="color: #8A8680; font-size: 12px; margin-top: 20px;">RentWear — Rent the extraordinary.</p>
  </div>
`;

exports.bookingConfirmedEmail = (name, productTitle, startDate, endDate, grandTotal) =>
  wrapper('Booking Confirmed 🎉', `
    <p style="color: #1B1B1F; font-size: 14px;">Hi ${name},</p>
    <p style="color: #1B1B1F; font-size: 14px;">Your booking for <strong>${productTitle}</strong> is confirmed.</p>
    <p style="color: #8A8680; font-size: 13px;">${startDate} – ${endDate}</p>
    <p style="color: #234D3B; font-size: 16px; font-weight: bold;">Total paid: ₹${grandTotal}</p>
  `);

exports.kycStatusEmail = (name, status) =>
  wrapper(
    status === 'verified' ? 'Identity Verified ✅' : 'Identity Verification Update',
    `
    <p style="color: #1B1B1F; font-size: 14px;">Hi ${name},</p>
    <p style="color: #1B1B1F; font-size: 14px;">
      ${status === 'verified'
        ? 'Your identity has been verified. You can now rent any product on RentWear.'
        : 'Your identity document was not approved. Please upload a clearer copy and try again.'}
    </p>
  `);

exports.orderStatusEmail = (name, productTitle, status) =>
  wrapper('Order Update', `
    <p style="color: #1B1B1F; font-size: 14px;">Hi ${name},</p>
    <p style="color: #1B1B1F; font-size: 14px;">
      Your order for <strong>${productTitle}</strong> is now <strong style="color: #234D3B; text-transform: capitalize;">${status}</strong>.
    </p>
  `);

exports.newMessageEmail = (name, senderName, productTitle) =>
  wrapper('New Message 💬', `
    <p style="color: #1B1B1F; font-size: 14px;">Hi ${name},</p>
    <p style="color: #1B1B1F; font-size: 14px;">
      ${senderName} sent you a message about <strong>${productTitle}</strong>.
    </p>
  `);
