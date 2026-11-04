import { ApiError } from "../api/ApiError";
import { createServiceClient } from "../supabase/serviceClient";

const service = createServiceClient();

export async function getTiers() {
    try {
      const { data } = await service
        .from("platform_pricing")
        .select("fee_rule")
        .maybeSingle();
  
      const rule = data?.fee_rule;
      if (rule?.type === "tiered") return rule.tiers ?? [];
      if (rule?.type === "flat" && rule.amount != null) {
        return [{ key: "flat", label: "Any parcel", price: rule.amount }];
      }
      return [];
    } catch {
      throw new ApiError('Sorry something went wrong on our side, Please try again', 500);
    }
  }