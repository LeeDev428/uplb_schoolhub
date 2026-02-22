<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

class AccountCreatedNotification extends VerifyEmail
{
    public function __construct(
        private readonly string $loginIdentifier,
        private readonly string $initialPassword = 'password'
    ) {}

    public function toMail(mixed $notifiable): MailMessage
    {
        $verificationUrl = $this->verificationUrl($notifiable);
        $appName = config('app.name');

        return (new MailMessage)
            ->subject("Your {$appName} Account — Please Verify Your Email")
            ->greeting("Hello, {$notifiable->name}!")
            ->line("Welcome to **{$appName}**! Your account has been created by the school administration.")
            ->line(' ')
            ->line('**Your Login Credentials:**')
            ->line("• Email / Username: **{$this->loginIdentifier}**")
            ->line("• Password: **{$this->initialPassword}**")
            ->line('*Please change your password after your first login.*')
            ->line(' ')
            ->line('To activate your account, please verify your email address by clicking the button below:')
            ->action('Verify Email Address', $verificationUrl)
            ->line('This verification link will expire in **60 minutes**.')
            ->line('If you did not expect this email, you can safely ignore it.');
    }
}
