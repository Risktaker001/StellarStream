/**
 * Notification Service
 *
 * Dispatches "Stream Received" alerts to Discord or Telegram
 * for users who have registered a subscription for their Stellar address.
 */

import { PrismaClient } from '../generated/client/index.js';
import { logger } from '../logger.js';

const prisma = new PrismaClient();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? '';

// ── Payload ───────────────────────────────────────────────────────────────────

export interface StreamReceivedEvent {
  streamId:    string;
  sender:      string;
  receiver:    string;
  amount:      string;
  tokenAddress: string | null;
  txHash:      string;
}

// ── Formatters ────────────────────────────────────────────────────────────────

function formatDiscordPayload(event: StreamReceivedEvent): object {
  return {
    username: 'StellarStream 🌊',
    avatar_url: 'https://stellar.org/favicon.ico',
    embeds: [
      {
        title: '📥 Stream Received',
        description: 'A new payment stream has been created for you on **StellarStream**.',
        color: 0x7c3aed,
        fields: [
          { name: '💰 Amount',    value: `\`${event.amount}\``,      inline: true },
          { name: '🪙 Token',     value: event.tokenAddress ? `\`${event.tokenAddress}\`` : 'XLM', inline: true },
          { name: '🆔 Stream ID', value: `\`${event.streamId}\``,    inline: false },
          { name: '📤 From',      value: `\`${event.sender}\``,      inline: false },
          { name: '🔗 Tx',        value: `[View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/${event.txHash})`, inline: false },
        ],
        footer: { text: 'StellarStream • Real-time asset streaming on Stellar' },
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

function formatTelegramMessage(event: StreamReceivedEvent): string {
  const token = event.tokenAddress ?? 'XLM';
  return [
    '📥 *Stream Received*',
    '',
    `💰 *Amount:* \`${event.amount}\` ${token}`,
    `🆔 *Stream ID:* \`${event.streamId}\``,
    `📤 *From:* \`${event.sender}\``,
    `🔗 [View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/${event.txHash})`,
  ].join('\n');
}

// ── Dispatch helpers ──────────────────────────────────────────────────────────

async function sendDiscord(webhookUrl: string, event: StreamReceivedEvent): Promise<void> {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formatDiscordPayload(event)),
  });
  if (!res.ok) {
    throw new Error(`Discord webhook failed: ${res.status} ${res.statusText}`);
  }
}

async function sendTelegram(chatId: string, event: StreamReceivedEvent): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN is not configured');
  }
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id:    chatId,
      text:       formatTelegramMessage(event),
      parse_mode: 'Markdown',
      disable_web_page_preview: false,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram API failed: ${res.status} — ${body}`);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export class NotificationService {
  /**
   * Look up all active subscriptions for the receiver address and
   * dispatch a "Stream Received" notification to each platform.
   */
  async notifyStreamReceived(event: StreamReceivedEvent): Promise<void> {
    const subs = await (prisma as any).notificationSubscription.findMany({
      where: { stellarAddress: event.receiver, isActive: true },
    });

    if (subs.length === 0) return;

    await Promise.allSettled(
      subs.map(async (sub: any) => {
        try {
          if (sub.platform === 'discord' && sub.webhookUrl) {
            await sendDiscord(sub.webhookUrl, event);
            logger.info('[Notification] Discord alert sent', { receiver: event.receiver, streamId: event.streamId });
          } else if (sub.platform === 'telegram' && sub.chatId) {
            await sendTelegram(sub.chatId, event);
            logger.info('[Notification] Telegram alert sent', { receiver: event.receiver, streamId: event.streamId });
          }
        } catch (err) {
          logger.error('[Notification] Dispatch failed', { platform: sub.platform, receiver: event.receiver, err });
        }
      })
    );
  }
}
