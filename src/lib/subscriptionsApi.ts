import { supabase } from './supabase';

export interface Subscription {
  id: string;
  user_id: string;
  plan_name: 'mini' | 'odbornik' | 'expert' | 'profik' | 'premier';
  billing_period: 'monthly' | 'yearly' | 'lifetime';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  current_period_start: string;
  current_period_end?: string;
  amount_paid: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentHistory {
  id: string;
  user_id: string;
  subscription_id?: string;
  stripe_payment_intent_id?: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending' | 'refunded';
  payment_method?: string;
  created_at: string;
}

export async function getUserActiveSubscription(): Promise<Subscription | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching active subscription:', error);
    return null;
  }

  return data && data.length > 0 ? data[0] : null;
}

export async function getUserSubscriptions(): Promise<Subscription[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching subscriptions:', error);
    return [];
  }

  return data || [];
}

export async function getUserPaymentHistory(): Promise<PaymentHistory[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('payment_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching payment history:', error);
    return [];
  }

  return data || [];
}

export async function createSubscription(
  planName: Subscription['plan_name'],
  billingPeriod: Subscription['billing_period'],
  amount: number,
  stripeData?: {
    customerId: string;
    subscriptionId: string;
  }
): Promise<Subscription | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const currentPeriodStart = new Date();
  let currentPeriodEnd: Date | null = null;

  if (billingPeriod === 'monthly') {
    currentPeriodEnd = new Date();
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
  } else if (billingPeriod === 'yearly') {
    currentPeriodEnd = new Date();
    currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
  }

  const subscriptionData: any = {
    user_id: user.id,
    plan_name: planName,
    billing_period: billingPeriod,
    status: 'active',
    amount_paid: amount,
    current_period_start: currentPeriodStart.toISOString(),
  };

  if (currentPeriodEnd) {
    subscriptionData.current_period_end = currentPeriodEnd.toISOString();
  }

  if (stripeData) {
    subscriptionData.stripe_customer_id = stripeData.customerId;
    subscriptionData.stripe_subscription_id = stripeData.subscriptionId;
  }

  const { data: oldSubscriptions } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active');

  if (oldSubscriptions && oldSubscriptions.length > 0) {
    await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .in('id', oldSubscriptions.map(s => s.id));
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .insert(subscriptionData)
    .select()
    .single();

  if (error) {
    console.error('Error creating subscription:', error);
    return null;
  }

  return data;
}

export async function recordPayment(
  subscriptionId: string,
  amount: number,
  status: PaymentHistory['status'],
  stripePaymentIntentId?: string,
  paymentMethod?: string
): Promise<PaymentHistory | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('payment_history')
    .insert({
      user_id: user.id,
      subscription_id: subscriptionId,
      amount,
      status,
      stripe_payment_intent_id: stripePaymentIntentId,
      payment_method: paymentMethod,
    })
    .select()
    .single();

  if (error) {
    console.error('Error recording payment:', error);
    return null;
  }

  return data;
}

export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('id', subscriptionId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error cancelling subscription:', error);
    return false;
  }

  return true;
}
