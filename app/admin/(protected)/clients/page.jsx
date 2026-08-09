// app/admin/(protected)/clients/page.jsx
import { Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import FeeRuleEditor from '@/components/FeeRuleEditor'

export default async function ClientsPage() {
  const supabase = await createClient()

  const { data: clients, error } = await supabase
    .from('clients')
    .select('id, name, api_key, default_zone, webhook_url, fee_rule, created_at')
    .order('created_at')

  return (
    <div className="max-w-3xl">
      <div className="mb-5">
        <h2 className="font-display text-xl font-semibold">Clients</h2>
        <p className="text-sm text-[color:var(--color-muted)]">
          Businesses integrated with the delivery platform.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-4">
          Couldn&apos;t load clients: {error.message}
        </p>
      )}

      <div className="space-y-3">
        {clients?.length === 0 && (
          <div className="glass-card-solid p-6 text-center text-sm text-[color:var(--color-muted)]">
            No clients yet — run seed.js to add Corn Mart.
          </div>
        )}
        {clients?.map((client) => (
          <div key={client.id} className="glass-card-solid p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="flex items-center justify-center h-9 w-9 rounded-full bg-[color:var(--color-primary-pale)]">
                <Building2 size={16} className="text-[color:var(--color-primary-dark)]" />
              </span>
              <div>
                <p className="font-medium text-sm">{client.name}</p>
                <p className="text-xs text-[color:var(--color-muted)]">
                  {client.default_zone || 'No default zone set'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-[color:var(--color-muted)] mb-0.5">
                  API key
                </p>
                <p className="font-mono-tracking text-xs bg-black/[0.03] px-2 py-1.5 rounded-md break-all">
                  {client.api_key}
                </p>
              </div>
              <div>
                <p className="text-xs text-[color:var(--color-muted)] mb-0.5">
                  Webhook URL
                </p>
                <p className="text-xs text-[color:var(--color-ink)] break-all">
                  {client.webhook_url || (
                    <span className="text-[color:var(--color-muted)]">
                      Not configured
                    </span>
                  )}
                </p>
              </div>
            </div>

            <hr className="my-4 border-[color:var(--color-border)]" />
            <FeeRuleEditor clientId={client.id} feeRule={client.fee_rule} />
          </div>
        ))}
      </div>
    </div>
  )
}
