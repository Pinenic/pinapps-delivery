import { createClient } from "../supabase/server";
import { DeliveryError } from "./bookingDb";

const supabase = createClient();
const ORDER_FIELDS =
  "id, pickup_name, pickup_address, dropoff_name, dropoff_address, status, delivery_fee, created_at, parcels(description, weight_kg, fragile)";
  
export async function getConsumerOrders(userId) {
  const { data: orders, error } = (await supabase)
    .from("delivery_orders")
    .select(ORDER_FIELDS)
    .eq("consumer_id", userId)
    .order("created_at", { ascending: false });

    if(error){
        throw new DeliveryError("Something went wrong on our side", 500, error);
    }

    return orders
}

export async function getConsumerOrderById(userId, deliveryId) {
    const { data: order, error } = await supabase
    .from('delivery_orders')
    .select(ORDER_FIELDS)
    .eq('id', deliveryId)
    .eq('consumer_id', userId)
    .maybeSingle();

    if(error){
        throw new DeliveryError("something went wrong", 500, error)
    }

    return order;
}
