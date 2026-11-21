import { Navbar } from "@/components/navbar";

export default function BlogPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-black font-(family-name:--font-geist-sans) text-zinc-100">
      <div data-intro="down">
        <Navbar />
      </div>
    </div>
  );
}
