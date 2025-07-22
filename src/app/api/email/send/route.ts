import { NextRequest, NextResponse } from 'next/server';
import { createTransport } from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, text, cc, bcc } = await request.json();

    // Validate required fields
    if (!to || !subject || (!html && !text)) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, and html/text' },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      text,
      cc,
      bcc,
    };

    // Send email
    const result = await transporter.sendMail(mailOptions);

    return NextResponse.json(
      {
        success: true,
        messageId: result.messageId,
        message: 'Email sent successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error sending email:', error);

    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
