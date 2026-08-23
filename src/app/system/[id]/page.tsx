import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PromptGenerator from "@/components/PromptGenerator";
import SystemDetail from "@/components/SystemDetail";
import { getSystemById, systems } from "@/data/systems";

export function generateStaticParams() {
  return systems.map((s) => ({ id: s.id }));
}

export async function generateMetadata(props: PageProps<"/system/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const system = getSystemById(id);
  if (!system) return {};
  return {
    title: system.name,
    description: system.description,
  };
}

export default async function SystemPage(props: PageProps<"/system/[id]">) {
  const { id } = await props.params;
  const system = getSystemById(id);
  if (!system) notFound();

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
      <SystemDetail system={system} />

      <section className="mt-10 border-t hairline pt-8">
        <h2 className="mb-4 font-serif text-xl text-charcoal">產生這個系統的 Prompt</h2>
        <PromptGenerator systems={[system]} />
      </section>
    </div>
  );
}
