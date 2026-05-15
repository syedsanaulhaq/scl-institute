// ===============================================
// Email Service Module
// Handles student notifications
// ===============================================

const nodemailer = require('nodemailer');

// Create email transporter
// For development, using Gmail SMTP or fallback to console logging
const createTransporter = () => {
    // Check if we have SMTP credentials in environment
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    // Fallback to Gmail if Gmail credentials available
    if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });
    }

    // Development mode: log emails to console
    return {
        sendMail: async (mailOptions) => {
            console.log('[EMAIL SERVICE] Development Mode - Email would be sent:');
            console.log('To:', mailOptions.to);
            console.log('Subject:', mailOptions.subject);
            console.log('Body:', mailOptions.html);
            return { messageId: 'dev-mode-' + Date.now() };
        }
    };
};

const transporter = createTransporter();

// ===============================================
// Email Templates
// ===============================================

const studentWelcomeTemplate = (studentName, studentEmail, tempPassword, programmeName) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .credentials-box { background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .credentials-box p { margin: 10px 0; }
        .label { font-weight: bold; color: #667eea; }
        .value { font-family: monospace; background: #f0f0f0; padding: 8px 12px; border-radius: 4px; display: inline-block; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to SCL Institute!</h1>
            <p>Your application has been approved</p>
        </div>
        <div class="content">
            <p>Dear <strong>${studentName}</strong>,</p>
            
            <p>Congratulations! Your application to <strong>${programmeName}</strong> has been approved. We are excited to have you join SCL Institute.</p>
            
            <p>Your student account has been created. Please use the credentials below to log in to your student portal:</p>
            
            <div class="credentials-box">
                <p><span class="label">Email (Username):</span><br>
                <span class="value">${studentEmail}</span></p>
                
                <p><span class="label">Temporary Password:</span><br>
                <span class="value">${tempPassword}</span></p>
                
                <p style="margin-top: 15px; font-size: 12px; color: #666;">
                    <strong>⚠️ Important:</strong> This is a temporary password. You will be asked to change it on your first login.
                </p>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
                <li>Log in to your student portal at <a href="http://localhost:3000">http://localhost:3000</a></li>
                <li>Change your temporary password immediately</li>
                <li>Complete your profile information</li>
                <li>Upload required documents in the Admissions section</li>
                <li>Review your programme details and timetable</li>
            </ol>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our Student Services team.</p>
            
            <a href="http://localhost:3000" class="button">Access Student Portal</a>
            
            <div class="footer">
                <p>&copy; 2026 SCL Institute. All rights reserved.</p>
                <p>For support, contact: support@sclinstitute.ac.uk | +44 (0) 20 1234 5678</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
};

const conditionalApprovalTemplate = (studentName, programmeName, conditions) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .conditions-box { background: white; border-left: 4px solid #f5576c; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .conditions-box li { margin: 10px 0; }
        .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Conditional Offer Received</h1>
            <p>Your application has been conditionally approved</p>
        </div>
        <div class="content">
            <p>Dear <strong>${studentName}</strong>,</p>
            
            <p>Thank you for your application to <strong>${programmeName}</strong>. We are pleased to inform you that your application has been <strong>conditionally approved</strong>.</p>
            
            <p><strong>Conditions to be met:</strong></p>
            <div class="conditions-box">
                <ul>
                    ${conditions.split('\n').map(c => c.trim()).filter(c => c).map(c => `<li>${c}</li>`).join('')}
                </ul>
            </div>
            
            <p>Please review these conditions carefully and submit the required information as soon as possible. Once we receive and verify your documents, your offer will be confirmed.</p>
            
            <p><strong>What happens next:</strong></p>
            <ol>
                <li>Log in to your student portal to view full details</li>
                <li>Upload the required documents in the Admissions section</li>
                <li>Our team will review and confirm your enrolment</li>
            </ol>
            
            <p>If you have any questions about these conditions or need assistance, please contact our Student Services team immediately.</p>
            
            <div class="footer">
                <p>&copy; 2026 SCL Institute. All rights reserved.</p>
                <p>For support, contact: support@sclinstitute.ac.uk | +44 (0) 20 1234 5678</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
};

// ===============================================
// Email Sending Functions
// ===============================================

const sendStudentWelcomeEmail = async (email, firstName, lastName, tempPassword, programmeName) => {
    try {
        const studentName = `${firstName} ${lastName}`.trim();
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@sclinstitute.ac.uk',
            to: email,
            subject: '🎉 Welcome to SCL Institute - Your Student Account Created',
            html: studentWelcomeTemplate(studentName, email, tempPassword, programmeName)
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Welcome email sent to ${email}:`, info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('[EMAIL ERROR] Failed to send welcome email:', error.message);
        return { success: false, error: error.message };
    }
};

const sendConditionalApprovalEmail = async (email, firstName, lastName, programmeName, conditions) => {
    try {
        const studentName = `${firstName} ${lastName}`.trim();
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@sclinstitute.ac.uk',
            to: email,
            subject: '✅ Conditional Offer - SCL Institute',
            html: conditionalApprovalTemplate(studentName, programmeName, conditions)
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Conditional approval email sent to ${email}:`, info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('[EMAIL ERROR] Failed to send conditional approval email:', error.message);
        return { success: false, error: error.message };
    }
};

const sendAdminNotificationEmail = async (email, studentName, programmeName, decision) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@sclinstitute.ac.uk',
            to: email,
            subject: `[ADMIN] Application Decision: ${decision} - ${studentName}`,
            html: `
                <h2>Application Decision Notification</h2>
                <p><strong>Student:</strong> ${studentName}</p>
                <p><strong>Programme:</strong> ${programmeName}</p>
                <p><strong>Decision:</strong> ${decision}</p>
                <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                <hr>
                <p>Log in to the admin portal to view full details.</p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Admin notification sent:`, info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('[EMAIL ERROR] Failed to send admin notification:', error.message);
        return { success: false, error: error.message };
    }
};

// ===============================================
// Fee Reminder Email
// ===============================================
const sendFeeReminderEmail = async (feeRecord) => {
    try {
        const subject = `Payment Reminder — ${feeRecord.course_code} — SCL Institute`;

        const fmtGbp = (n) => `£${(parseFloat(n) || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '—';

        const labels = ['Year 1 — Semester 1', 'Year 1 — Semester 2', 'Year 2 — Semester 1', 'Year 2 — Semester 2'];
        const unpaid = [];
        for (let i = 1; i <= 4; i++) {
            const amt = parseFloat(feeRecord[`instalment_${i}_amount`]);
            const waived = feeRecord[`instalment_${i}_waived`];
            if (amt > 0 && !feeRecord[`instalment_${i}_paid`] && !waived) {
                unpaid.push({ label: labels[i - 1], amount: amt, due: feeRecord[`instalment_${i}_due`] });
            }
        }

        const rows = unpaid.map(ins =>
            `<tr>
              <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;color:#374151">${ins.label}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;color:#6b7280">Due: ${fmtDate(ins.due)}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:bold;color:#b45309">${fmtGbp(ins.amount)}</td>
            </tr>`
        ).join('');

        const html = `<!DOCTYPE html>
<html><head><style>body{font-family:Arial,sans-serif;color:#333;margin:0;padding:0}table{border-collapse:collapse}</style></head>
<body>
  <div style="max-width:600px;margin:0 auto;padding:20px">
    <div style="background:linear-gradient(135deg,#5b21b6 0%,#7c3aed 100%);color:white;padding:24px;border-radius:8px 8px 0 0;text-align:center">
      <h1 style="margin:0;font-size:22px">SCL Institute — Payment Reminder</h1>
    </div>
    <div style="background:#f9fafb;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb">
      <p>Dear <strong>${feeRecord.student_name || 'Student'}</strong>,</p>
      <p>This is a friendly reminder that you have outstanding fee payments for your course at SCL Institute.</p>
      <div style="background:white;border-radius:8px;border:1px solid #e5e7eb;margin:16px 0;overflow:hidden">
        <div style="background:#f3f4f6;padding:12px 16px;font-weight:bold;font-size:14px;color:#1f2937">
          ${feeRecord.course_code} — ${feeRecord.course_title || ''}
        </div>
        <table width="100%" style="font-size:14px">
          <thead>
            <tr style="background:#fafafa">
              <th style="text-align:left;padding:8px 12px;color:#6b7280;font-weight:600">Semester</th>
              <th style="text-align:right;padding:8px 12px;color:#6b7280;font-weight:600">Due Date</th>
              <th style="text-align:right;padding:8px 12px;color:#6b7280;font-weight:600">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="3" style="padding:12px;text-align:center;color:#9ca3af">All instalments up to date</td></tr>'}
          </tbody>
        </table>
      </div>
      <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:12px 16px;margin:16px 0">
        <table width="100%" style="font-size:14px">
          <tr><td style="color:#92400e;padding:4px 0">Total Fee:</td><td style="text-align:right;font-weight:bold;color:#92400e">${fmtGbp(feeRecord.total_fee_gbp)}</td></tr>
          <tr><td style="color:#065f46;padding:4px 0">Paid:</td><td style="text-align:right;font-weight:bold;color:#065f46">${fmtGbp(feeRecord.total_paid)}</td></tr>
          <tr><td style="color:#b45309;font-weight:bold;padding:4px 0">Balance Due:</td><td style="text-align:right;font-weight:bold;color:#b45309">${fmtGbp(feeRecord.balance_due)}</td></tr>
        </table>
      </div>
      <p style="font-size:14px;color:#374151">If you have any questions about your fees or need to discuss payment arrangements, please contact the SCL Institute finance team.</p>
      <p style="font-size:14px;margin-top:24px">Regards,<br><strong>SCL Institute Finance Team</strong></p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
      <p style="font-size:11px;color:#9ca3af;text-align:center">SCL Institute — This is an automated reminder. Please do not reply to this email.</p>
    </div>
  </div>
</body></html>`;

        const result = await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER || process.env.GMAIL_USER || 'noreply@sclsandbox.xyz',
            to: feeRecord.student_email,
            subject,
            html
        });
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('[EMAIL ERROR] Failed to send fee reminder:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendStudentWelcomeEmail,
    sendConditionalApprovalEmail,
    sendAdminNotificationEmail,
    sendFeeReminderEmail
};
