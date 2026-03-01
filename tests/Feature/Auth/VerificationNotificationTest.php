<?php

use App\Models\User;
use App\Notifications\AccountCreatedNotification;
use Illuminate\Support\Facades\Notification;

test('sends verification notification', function () {
    Notification::fake();

    $user = User::factory()->unverified()->create(['role' => 'student']);

    $this->actingAs($user)
        ->post(route('verification.send'))
        ->assertRedirect('/');

    Notification::assertSentTo($user, AccountCreatedNotification::class);
});

test('does not send verification notification if email is verified', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('verification.send'))
        ->assertRedirect(route('dashboard', absolute: false));

    Notification::assertNothingSent();
});