import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { createSubscription, updateSubscriptionByUserId } from "@/lib/db/queries/subscriptions";
import type { SubscriptionPlan, SubscriptionStatus } from "@/lib/types/user";

/**
 * POST /api/webhooks/stripe
 * Stripe webhook handler for subscription events
 * 
 * This endpoint handles Stripe webhook events related to subscriptions:
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 * 
 * Note: In production, you should verify the webhook signature using Stripe's SDK.
 * For now, this is a basic implementation that can be enhanced with proper signature verification.
 */
export async function POST(request: Request) {
  try {
    // Get webhook secret from environment
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not set");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }
    
    // Get the raw body and signature from headers
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");
    
    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }
    
    // Get the raw body
    const body = await request.text();
    
    // TODO: Verify webhook signature using Stripe SDK
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    
    // For now, parse the JSON body directly
    // In production, use the verified event from Stripe SDK
    const event = JSON.parse(body) as {
      type: string;
      data: {
        object: {
          id: string;
          customer: string;
          status: string;
          plan?: {
            id: string;
          };
          metadata?: {
            clerk_user_id?: string;
          };
        };
      };
    };
    
    // Handle different event types
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const clerkUserId = subscription.metadata?.clerk_user_id;
        
        if (!clerkUserId) {
          console.error("Missing clerk_user_id in subscription metadata");
          return NextResponse.json(
            { error: "Missing clerk_user_id in subscription metadata" },
            { status: 400 }
          );
        }
        
        // Map Stripe plan ID to our plan type
        // In production, you should map Stripe plan IDs to your plan types
        const planMap: Record<string, SubscriptionPlan> = {
          "price_free": "free",
          "price_pro": "pro",
          "price_ultra": "ultra",
        };
        
        const planType = subscription.plan?.id
          ? planMap[subscription.plan.id] || "free"
          : "free";
        
        // Map Stripe status to our status
        const statusMap: Record<string, SubscriptionStatus> = {
          active: "active",
          past_due: "past_due",
          canceled: "canceled",
          unpaid: "canceled",
        };
        
        const subscriptionStatus = statusMap[subscription.status] || "active";
        
        // Get or create user
        try {
          const user = await getUserByClerkId(clerkUserId);
          
          // Update or create subscription
          try {
            await updateSubscriptionByUserId(user.id, {
              plan_type: planType,
              status: subscriptionStatus,
            });
          } catch {
            // Subscription doesn't exist, create it
            await createSubscription({
              user_id: user.id,
              plan_type: planType,
              status: subscriptionStatus,
            });
          }
        } catch (error) {
          console.error("Error updating subscription:", error);
          return NextResponse.json(
            { error: "Failed to update subscription" },
            { status: 500 }
          );
        }
        
        return NextResponse.json({ received: true });
      }
      
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const clerkUserId = subscription.metadata?.clerk_user_id;
        
        if (!clerkUserId) {
          console.error("Missing clerk_user_id in subscription metadata");
          return NextResponse.json(
            { error: "Missing clerk_user_id in subscription metadata" },
            { status: 400 }
          );
        }
        
        try {
          const user = await getUserByClerkId(clerkUserId);
          
          // Update subscription to canceled
          await updateSubscriptionByUserId(user.id, {
            status: "canceled",
          });
        } catch (error) {
          console.error("Error canceling subscription:", error);
          return NextResponse.json(
            { error: "Failed to cancel subscription" },
            { status: 500 }
          );
        }
        
        return NextResponse.json({ received: true });
      }
      
      case "invoice.payment_succeeded": {
        // Handle successful payment - ensure subscription is active
        const invoice = event.data.object;
        const clerkUserId = invoice.metadata?.clerk_user_id;
        
        if (clerkUserId) {
          try {
            const user = await getUserByClerkId(clerkUserId);
            await updateSubscriptionByUserId(user.id, {
              status: "active",
            });
          } catch (error) {
            console.error("Error updating subscription status:", error);
          }
        }
        
        return NextResponse.json({ received: true });
      }
      
      case "invoice.payment_failed": {
        // Handle failed payment - set subscription to past_due
        const invoice = event.data.object;
        const clerkUserId = invoice.metadata?.clerk_user_id;
        
        if (clerkUserId) {
          try {
            const user = await getUserByClerkId(clerkUserId);
            await updateSubscriptionByUserId(user.id, {
              status: "past_due",
            });
          } catch (error) {
            console.error("Error updating subscription status:", error);
          }
        }
        
        return NextResponse.json({ received: true });
      }
      
      default:
        // Unknown event type - log but don't fail
        console.log(`Unhandled event type: ${event.type}`);
        return NextResponse.json({ received: true });
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      {
        error: "Webhook processing failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

