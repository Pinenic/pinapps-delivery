import AdminHeader from "@/components/AdminHeader";
import Image from "next/image";

export default function AdminSLayout({ children }) {
  return (
    <body className="relative min-h-full flex flex-col">
      <Image
        src="/images/bg-light.png"
        alt="Background Description"
        fill
        className="object-cover -z-10"
        priority // Add this if it's the Largest Contentful Paint (LCP)
      />
      <header className="sticky z-40">
        <AdminHeader />
      </header>
      <section className="px-4 overflow-scroll">{children}</section>
    </body>
  );
}
