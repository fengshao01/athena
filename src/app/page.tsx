import Footer from "@/components/Footer";
import Greeting from "@/components/Greeting";
import RemembersList from "@/components/RemembersList";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-16 sm:py-24">
        <Greeting />
        <RemembersList />
      </main>
      <Footer />
    </div>
  );
}
