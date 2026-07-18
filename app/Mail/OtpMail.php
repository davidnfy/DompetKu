<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public $code;
    public $typeLabel;

    /**
     * Create a new message instance.
     */
    public function __construct(string $code, string $type)
    {
        $this->code = $code;
        
        switch ($type) {
            case 'register':
                $this->typeLabel = 'Registrasi Akun Baru';
                break;
            case 'reset':
                $this->typeLabel = 'Reset Password';
                break;
            case 'login':
            default:
                $this->typeLabel = 'Verifikasi Login';
                break;
        }
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            from: new \Illuminate\Mail\Mailables\Address('mail.dompetku@gmail.com', 'DompetKu'),
            subject: "[DompetKu] Kode OTP " . $this->typeLabel,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.otp',
            with: [
                'code' => $this->code,
                'typeLabel' => $this->typeLabel,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
