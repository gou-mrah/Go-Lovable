// ============================================
// EMAIL TEMPLATES FOR GO UMRAH
// ============================================

export const emailTemplates = {
  // ============================================
  // BOOKING CONFIRMATION EMAILS
  // ============================================

  hotelBookingConfirmation: (booking: any) => ({
    subject: `Hotel Booking Confirmation - ${booking.bookingNumber}`,
    html: `
      <h2>Booking Confirmation</h2>
      <p>Dear ${booking.guestName},</p>
      <p>Your hotel booking has been confirmed!</p>
      
      <h3>Booking Details:</h3>
      <ul>
        <li><strong>Booking Number:</strong> ${booking.bookingNumber}</li>
        <li><strong>Hotel:</strong> ${booking.hotelName}</li>
        <li><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</li>
        <li><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</li>
        <li><strong>Number of Guests:</strong> ${booking.guestCount}</li>
        <li><strong>Total Amount:</strong> ${booking.currency} ${booking.totalUSD}</li>
      </ul>
      
      <h3>Important Information:</h3>
      <ul>
        <li>Please arrive by 3:00 PM on your check-in date</li>
        <li>Your confirmation email is your receipt</li>
        <li>For cancellations, please contact us at least 48 hours before check-in</li>
      </ul>
      
      <p>Thank you for choosing Go Umrah!</p>
      <p>Best regards,<br/>Go Umrah Team</p>
    `,
  }),

  flightBookingConfirmation: (booking: any) => ({
    subject: `Flight Booking Confirmation - ${booking.bookingNumber}`,
    html: `
      <h2>Flight Booking Confirmation</h2>
      <p>Dear ${booking.passengerName},</p>
      <p>Your flight booking has been confirmed!</p>
      
      <h3>Flight Details:</h3>
      <ul>
        <li><strong>Booking Number:</strong> ${booking.bookingNumber}</li>
        <li><strong>Airline:</strong> ${booking.airline}</li>
        <li><strong>Flight Number:</strong> ${booking.flightNumber}</li>
        <li><strong>Departure:</strong> ${booking.departureCity} - ${new Date(booking.departureTime).toLocaleString()}</li>
        <li><strong>Arrival:</strong> ${booking.arrivalCity} - ${new Date(booking.arrivalTime).toLocaleString()}</li>
        <li><strong>Cabin Class:</strong> ${booking.cabinClass}</li>
        <li><strong>Total Amount:</strong> ${booking.currency} ${booking.totalUSD}</li>
      </ul>
      
      <h3>Passenger Information:</h3>
      <ul>
        <li><strong>Name:</strong> ${booking.passengerName}</li>
        <li><strong>Passport:</strong> ${booking.passportNumber}</li>
      </ul>
      
      <p>Please arrive at the airport 3 hours before departure.</p>
      <p>Best regards,<br/>Go Umrah Team</p>
    `,
  }),

  packageBookingConfirmation: (booking: any) => ({
    subject: `Package Booking Confirmation - ${booking.bookingNumber}`,
    html: `
      <h2>Package Booking Confirmation</h2>
      <p>Dear ${booking.guestName},</p>
      <p>Your Umrah package booking has been confirmed!</p>
      
      <h3>Package Details:</h3>
      <ul>
        <li><strong>Booking Number:</strong> ${booking.bookingNumber}</li>
        <li><strong>Package:</strong> ${booking.packageName}</li>
        <li><strong>Duration:</strong> ${booking.duration} days</li>
        <li><strong>Start Date:</strong> ${new Date(booking.startDate).toLocaleDateString()}</li>
        <li><strong>Number of Participants:</strong> ${booking.participants}</li>
        <li><strong>Total Amount:</strong> ${booking.currency} ${booking.totalUSD}</li>
      </ul>
      
      <h3>Included Services:</h3>
      <ul>
        ${booking.services.map((service: any) => `<li>${service}</li>`).join('')}
      </ul>
      
      <p>Our team will contact you shortly with more details.</p>
      <p>Best regards,<br/>Go Umrah Team</p>
    `,
  }),

  // ============================================
  // PAYMENT EMAILS
  // ============================================

  paymentReceipt: (payment: any) => ({
    subject: `Payment Receipt - ${payment.invoiceNumber}`,
    html: `
      <h2>Payment Receipt</h2>
      <p>Dear ${payment.customerName},</p>
      <p>Thank you for your payment!</p>
      
      <h3>Payment Details:</h3>
      <ul>
        <li><strong>Invoice Number:</strong> ${payment.invoiceNumber}</li>
        <li><strong>Booking Number:</strong> ${payment.bookingNumber}</li>
        <li><strong>Amount:</strong> ${payment.currency} ${payment.amount}</li>
        <li><strong>Payment Date:</strong> ${new Date(payment.paymentDate).toLocaleString()}</li>
        <li><strong>Payment Method:</strong> ${payment.paymentMethod}</li>
        <li><strong>Status:</strong> ${payment.status}</li>
      </ul>
      
      <h3>Booking Summary:</h3>
      <ul>
        <li><strong>Service:</strong> ${payment.serviceType}</li>
        <li><strong>Service Name:</strong> ${payment.serviceName}</li>
      </ul>
      
      <p>Your receipt has been attached to this email.</p>
      <p>Best regards,<br/>Go Umrah Team</p>
    `,
  }),

  invoiceEmail: (invoice: any) => ({
    subject: `Invoice - ${invoice.invoiceNumber}`,
    html: `
      <h2>Invoice</h2>
      <p>Dear ${invoice.customerName},</p>
      
      <h3>Invoice Details:</h3>
      <ul>
        <li><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</li>
        <li><strong>Invoice Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</li>
        <li><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</li>
      </ul>
      
      <h3>Items:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border: 1px solid #ddd;">
          <th style="padding: 8px; text-align: left;">Description</th>
          <th style="padding: 8px; text-align: right;">Amount</th>
        </tr>
        ${invoice.items.map((item: any) => `
          <tr style="border: 1px solid #ddd;">
            <td style="padding: 8px;">${item.description}</td>
            <td style="padding: 8px; text-align: right;">${item.currency} ${item.amount}</td>
          </tr>
        `).join('')}
        <tr style="border: 1px solid #ddd; font-weight: bold;">
          <td style="padding: 8px;">Total</td>
          <td style="padding: 8px; text-align: right;">${invoice.currency} ${invoice.total}</td>
        </tr>
      </table>
      
      <p>Please pay by the due date. Bank details are provided below.</p>
      <p>Best regards,<br/>Go Umrah Team</p>
    `,
  }),

  // ============================================
  // CANCELLATION EMAILS
  // ============================================

  bookingCancellationConfirmation: (booking: any) => ({
    subject: `Booking Cancellation Confirmation - ${booking.bookingNumber}`,
    html: `
      <h2>Booking Cancellation Confirmation</h2>
      <p>Dear ${booking.guestName},</p>
      <p>Your booking has been cancelled as requested.</p>
      
      <h3>Cancellation Details:</h3>
      <ul>
        <li><strong>Booking Number:</strong> ${booking.bookingNumber}</li>
        <li><strong>Cancellation Date:</strong> ${new Date(booking.cancellationDate).toLocaleString()}</li>
        <li><strong>Original Amount:</strong> ${booking.currency} ${booking.totalUSD}</li>
        <li><strong>Refund Amount:</strong> ${booking.currency} ${booking.refundAmount}</li>
        <li><strong>Refund Status:</strong> ${booking.refundStatus}</li>
      </ul>
      
      <p>The refund will be processed to your original payment method within 5-7 business days.</p>
      <p>Best regards,<br/>Go Umrah Team</p>
    `,
  }),

  // ============================================
  // SUPPORT EMAILS
  // ============================================

  supportTicketCreated: (ticket: any) => ({
    subject: `Support Ticket Created - ${ticket.ticketNumber}`,
    html: `
      <h2>Support Ticket Created</h2>
      <p>Dear ${ticket.customerName},</p>
      <p>Thank you for contacting Go Umrah support. We have received your ticket.</p>
      
      <h3>Ticket Details:</h3>
      <ul>
        <li><strong>Ticket Number:</strong> ${ticket.ticketNumber}</li>
        <li><strong>Subject:</strong> ${ticket.subject}</li>
        <li><strong>Category:</strong> ${ticket.category}</li>
        <li><strong>Priority:</strong> ${ticket.priority}</li>
        <li><strong>Status:</strong> ${ticket.status}</li>
      </ul>
      
      <p>Our support team will review your request and respond as soon as possible.</p>
      <p>You can track your ticket at: https://goumrah.com/support/tickets/${ticket.ticketNumber}</p>
      <p>Best regards,<br/>Go Umrah Support Team</p>
    `,
  }),

  supportTicketResolved: (ticket: any) => ({
    subject: `Support Ticket Resolved - ${ticket.ticketNumber}`,
    html: `
      <h2>Support Ticket Resolved</h2>
      <p>Dear ${ticket.customerName},</p>
      <p>Your support ticket has been resolved.</p>
      
      <h3>Ticket Details:</h3>
      <ul>
        <li><strong>Ticket Number:</strong> ${ticket.ticketNumber}</li>
        <li><strong>Subject:</strong> ${ticket.subject}</li>
        <li><strong>Resolution:</strong> ${ticket.resolution}</li>
      </ul>
      
      <p>If you have any further questions, please don't hesitate to contact us.</p>
      <p>Best regards,<br/>Go Umrah Support Team</p>
    `,
  }),

  // ============================================
  // NOTIFICATION EMAILS
  // ============================================

  bookingReminder: (booking: any) => ({
    subject: `Reminder: Your ${booking.serviceType} booking is coming up`,
    html: `
      <h2>Booking Reminder</h2>
      <p>Dear ${booking.guestName},</p>
      <p>This is a reminder that your ${booking.serviceType} booking is coming up soon.</p>
      
      <h3>Booking Details:</h3>
      <ul>
        <li><strong>Booking Number:</strong> ${booking.bookingNumber}</li>
        <li><strong>Service:</strong> ${booking.serviceName}</li>
        <li><strong>Date:</strong> ${new Date(booking.bookingDate).toLocaleDateString()}</li>
      </ul>
      
      <p>Please ensure you have all necessary documents and information ready.</p>
      <p>Best regards,<br/>Go Umrah Team</p>
    `,
  }),

  // ============================================
  // ACCOUNT EMAILS
  // ============================================

  welcomeEmail: (user: any) => ({
    subject: 'Welcome to Go Umrah!',
    html: `
      <h2>Welcome to Go Umrah</h2>
      <p>Dear ${user.firstName},</p>
      <p>Welcome to Go Umrah! We're excited to have you on board.</p>
      
      <p>Your account has been created successfully. You can now:</p>
      <ul>
        <li>Search and book hotels</li>
        <li>Book flights</li>
        <li>Explore Umrah packages</li>
        <li>Apply for visas</li>
        <li>Book tours and guides</li>
      </ul>
      
      <p>To get started, visit: https://goumrah.com/dashboard</p>
      <p>Best regards,<br/>Go Umrah Team</p>
    `,
  }),

  passwordResetEmail: (user: any, resetLink: string) => ({
    subject: 'Reset Your Go Umrah Password',
    html: `
      <h2>Password Reset Request</h2>
      <p>Dear ${user.firstName},</p>
      <p>We received a request to reset your password.</p>
      
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br/>Go Umrah Team</p>
    `,
  }),

  emailVerification: (user: any, verificationLink: string) => ({
    subject: 'Verify Your Go Umrah Email',
    html: `
      <h2>Email Verification</h2>
      <p>Dear ${user.firstName},</p>
      <p>Please verify your email address to complete your Go Umrah account setup.</p>
      
      <p>Click the link below to verify your email:</p>
      <p><a href="${verificationLink}">Verify Email</a></p>
      
      <p>This link will expire in 24 hours.</p>
      <p>Best regards,<br/>Go Umrah Team</p>
    `,
  }),

  // ============================================
  // PROMOTIONAL EMAILS
  // ============================================

  specialOffer: (user: any, offer: any) => ({
    subject: `Special Offer: ${offer.title}`,
    html: `
      <h2>${offer.title}</h2>
      <p>Dear ${user.firstName},</p>
      <p>${offer.description}</p>
      
      <h3>Offer Details:</h3>
      <ul>
        <li><strong>Discount:</strong> ${offer.discount}%</li>
        <li><strong>Valid Until:</strong> ${new Date(offer.expiryDate).toLocaleDateString()}</li>
        <li><strong>Code:</strong> ${offer.code}</li>
      </ul>
      
      <p><a href="https://goumrah.com/offers/${offer.id}">View Offer</a></p>
      <p>Best regards,<br/>Go Umrah Team</p>
    `,
  }),

  // ============================================
  // ADMIN EMAILS
  // ============================================

  newBookingNotification: (booking: any) => ({
    subject: `New Booking: ${booking.bookingNumber}`,
    html: `
      <h2>New Booking Notification</h2>
      <p>A new booking has been created:</p>
      
      <h3>Booking Details:</h3>
      <ul>
        <li><strong>Booking Number:</strong> ${booking.bookingNumber}</li>
        <li><strong>Guest Name:</strong> ${booking.guestName}</li>
        <li><strong>Service Type:</strong> ${booking.serviceType}</li>
        <li><strong>Amount:</strong> ${booking.currency} ${booking.totalUSD}</li>
        <li><strong>Status:</strong> ${booking.status}</li>
      </ul>
      
      <p><a href="https://admin.goumrah.com/bookings/${booking.id}">View Booking</a></p>
    `,
  }),

  paymentFailureNotification: (payment: any) => ({
    subject: `Payment Failed: ${payment.invoiceNumber}`,
    html: `
      <h2>Payment Failure Notification</h2>
      <p>A payment has failed:</p>
      
      <h3>Payment Details:</h3>
      <ul>
        <li><strong>Invoice Number:</strong> ${payment.invoiceNumber}</li>
        <li><strong>Amount:</strong> ${payment.currency} ${payment.amount}</li>
        <li><strong>Error:</strong> ${payment.error}</li>
      </ul>
      
      <p><a href="https://admin.goumrah.com/payments/${payment.id}">View Payment</a></p>
    `,
  }),
};

// ============================================
// EMAIL SENDING FUNCTION
// ============================================

export async function sendEmail(
  to: string,
  template: { subject: string; html: string }
): Promise<boolean> {
  try {
    // TODO: Implement email sending using SendGrid, Mailgun, or AWS SES
    // Example with SendGrid:
    // const msg = {
    //   to,
    //   from: 'noreply@goumrah.com',
    //   subject: template.subject,
    //   html: template.html,
    // };
    // await sgMail.send(msg);

    console.log(`Email sent to ${to}: ${template.subject}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// ============================================
// BATCH EMAIL SENDING
// ============================================

export async function sendBatchEmails(
  recipients: string[],
  template: { subject: string; html: string }
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const recipient of recipients) {
    const result = await sendEmail(recipient, template);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
}
