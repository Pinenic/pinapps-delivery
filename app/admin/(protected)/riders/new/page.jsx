// Creates a rider through POST /api/v1/admin/riders. The server creates
// the login with the password typed here (service role, so the admin's own
// browser session is never touched) and writes the riders row — status and
// rating are fixed server-side, not sent from this form.
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createRider } from "@/lib/services/adminService";

const MIN_PASSWORD = 8;

const initialForm = {
  name: "",
  phone: "",
  email: "",
  password: "",
  vehicle_type: "",
  license_no: "",
};

function Field({ label, hint, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-medium text-[#262620] mb-1">
        {label}
      </span>
      {children}
      {hint && <span className="block text-xs text-[#6B6A61] mt-1">{hint}</span>}
    </label>
  );
}

const inputClass =
  "w-full px-3 py-2 border border-[#E5E1D8] rounded-md text-sm bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 focus:border-[#D4A017]";

export default function NewRiderPage() {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }

    setSubmitting(true);
    try {
      await createRider(form);
      router.push("/admin/riders");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/admin/riders"
          className="text-sm text-[#6B6A61] hover:text-[#1E231C]"
        >
          ← Back to riders
        </Link>
        <h2 className="text-lg font-semibold text-[#262620] mt-2">New rider</h2>
        <p className="text-sm text-[#6B6A61]">Manually create a rider.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#E5E1D8] rounded-lg p-6"
      >
        <h3 className="text-sm font-semibold text-[#262620] mb-3">
          Rider Details
        </h3>
        <Field label="Full name">
          <input
            required
            maxLength={120}
            className={inputClass}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </Field>
        <Field label="Phone">
          <input
            required
            type="tel"
            placeholder="+2609XXXXXXXX"
            className={inputClass}
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </Field>
        <Field label="Email">
          <input
            required
            type="email"
            autoComplete="off"
            className={inputClass}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </Field>
        <Field
          label="Password"
          hint={`At least ${MIN_PASSWORD} characters. Share it with the rider securely.`}
        >
          <input
            required
            type="password"
            minLength={MIN_PASSWORD}
            autoComplete="new-password"
            className={inputClass}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />
        </Field>
        <Field label="Vehicle type">
          <input
            required
            maxLength={60}
            className={inputClass}
            value={form.vehicle_type}
            onChange={(e) => update("vehicle_type", e.target.value)}
          />
        </Field>
        <Field label="License number">
          <input
            required
            maxLength={60}
            className={inputClass}
            value={form.license_no}
            onChange={(e) => update("license_no", e.target.value)}
          />
        </Field>

        {error && (
          <p className="text-sm text-red-600 mt-4" role="alert">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 mt-6">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#1E231C] text-white text-sm px-5 py-2 rounded-md hover:bg-[#D4A017] hover:text-[#1E231C] transition-colors disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create rider"}
          </button>
          <Link
            href="/admin/riders"
            className="text-sm text-[#6B6A61] hover:text-[#1E231C]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}