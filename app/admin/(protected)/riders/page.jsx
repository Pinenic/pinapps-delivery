// app/admin/(protected)/riders/page.jsx
import { createClient } from '@/lib/supabase/server'

const STATUS_STYLES = {
  available: 'bg-green-100 text-green-700',
  busy: 'bg-yellow-100 text-yellow-700',
  offline: 'bg-gray-100 text-gray-700',
}

export default async function RidersPage() {
  const supabase = await createClient()

  const { data: riders, error } = await supabase
    .from('riders')
    .select('id, name, phone, vehicle_type, status, rating')
    .order('name')

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#262620]">Riders</h2>
        <p className="text-sm text-[#6B6A61]">
          All riders registered on the platform.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-4">
          Couldn&apos;t load riders: {error.message}
        </p>
      )}

      <div className="bg-white border border-[#E5E1D8] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FAF8F2] text-left text-[#6B6A61]">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Phone</th>
              <th className="px-4 py-2 font-medium">Vehicle</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Rating</th>
            </tr>
          </thead>
          <tbody>
            {riders?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-[#A8A79C]">
                  No riders yet — run seed.js to add test riders.
                </td>
              </tr>
            )}
            {riders?.map((rider) => (
              <tr key={rider.id} className="border-t border-[#EFECE4]">
                <td className="px-4 py-2">{rider.name}</td>
                <td className="px-4 py-2">{rider.phone}</td>
                <td className="px-4 py-2 capitalize">
                  {rider.vehicle_type || '—'}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      STATUS_STYLES[rider.status] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {rider.status}
                  </span>
                </td>
                <td className="px-4 py-2">{rider.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
