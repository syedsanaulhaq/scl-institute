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

module.exports = {
    sendStudentWelcomeEmail,
    sendConditionalApprovalEmail,
    sendAdminNotificationEmail
};
