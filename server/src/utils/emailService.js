const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

 exports.sendLeaveStatusEmail = async (to, details) => {
  const { name, leaveType, startDate, endDate, status, declineReason,approvedBy } = details;

  const isApproved = status === "Approved";
  const subject = isApproved
    ? `Your ${leaveType} has been Approved by ${approvedBy}`
    : `Your ${leaveType} has been Rejected by ${approvedBy}`;

  const messageBody = isApproved
    ? `<p style="color:#2E7D32;"><strong>Good news!</strong> Your leave request has been <strong>approved</strong>.</p>`
    : `<p style="color:#C62828;"><strong>Unfortunately,</strong> your leave request has been <strong>rejected</strong>.</p>
       <p><strong>Reason for rejection:</strong> ${declineReason || "No reason provided."}</p>`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #ddd;border-radius:8px;padding:20px;">
      <h2 style="color:#4A90E2;">Leave Request Update</h2>
      <p>Dear <strong>${name}</strong>,</p>
      ${messageBody}
      <table style="width:100%;border-collapse:collapse;margin-top:10px;">
        <tr><td style="padding:8px;border-bottom:1px solid #ddd;">Leave Type:</td><td style="padding:8px;border-bottom:1px solid #ddd;">${leaveType}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #ddd;">Duration:</td><td style="padding:8px;border-bottom:1px solid #ddd;">${startDate} → ${endDate}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #ddd;">Status:</td><td style="padding:8px;border-bottom:1px solid #ddd;">${status}</td></tr>
      </table>
      <p style="margin-top:20px;">Please check the <strong>OFFICE ASSISTANT APPLICATION</strong> for more details.</p>
      <p style="color:#999;font-size:12px;">This is an automated email — please do not reply.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `${process.env.TITLE}`,
    to,
    subject,
    html,
  });
};

exports.sendLeaveAppliedEmail = async (to, leaveDetails) => {
  const { name, leaveType, startDate, endDate, reason, durationDays } = leaveDetails;

  const mailOptions = {
    from: `${process.env.TITLE}`,
    to,
    subject: `New Leave Request from ${name}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #ddd;border-radius:8px;padding:20px;">
        <h2 style="color:#4A90E2;">Leave Request Notification</h2>
        <p><strong>${name}</strong> has applied for a leave.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:10px;">
          <tr><td style="padding:8px;border-bottom:1px solid #ddd;">Leave Type:</td><td style="padding:8px;border-bottom:1px solid #ddd;">${leaveType}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #ddd;">Duration:</td><td style="padding:8px;border-bottom:1px solid #ddd;">${startDate} → ${endDate} (${durationDays} day(s))</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #ddd;">Reason:</td><td style="padding:8px;border-bottom:1px solid #ddd;">${reason || "N/A"}</td></tr>
        </table>
        <p style="margin-top:20px;">Please review this request in the <strong>OFFICE ASSISTANT APPLICATION</strong>.</p>
        <p style="color:#999;font-size:12px;">This is an automated email — please do not reply.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

