/**
 * Единый интерфейс платёжного провайдера.
 * Сейчас реализован ЮKassa (Россия). Позже сюда же добавится
 * международный провайдер (Stripe/Checkout.com для Дубая/Черногории) —
 * без переписывания остального кода оплаты.
 */

export interface ReceiptItem {
  description: string;
  quantity: string;
  amount: { value: string; currency: string };
  vat_code: number;
  payment_mode?: string;
  payment_subject?: string;
}

export interface ReceiptData {
  customer?: { phone?: string; email?: string };
  items: ReceiptItem[];
}

export interface CreatePaymentInput {
  orderId: string;
  amount: number; // целое в основной валюте (у нас Order.total, ₽)
  currency: string; // 'RUB'
  description: string;
  returnUrl: string;
  receipt?: ReceiptData;
}

export interface CreatePaymentResult {
  paymentId: string;
  confirmationUrl: string;
  status: string;
}

export interface PaymentStatus {
  paymentId: string;
  status: string; // 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled'
  paid: boolean;
  orderId?: string;
  amount?: number;
}

export interface PaymentProvider {
  readonly name: string;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  getPaymentStatus(paymentId: string): Promise<PaymentStatus>;
}
