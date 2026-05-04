"use client";

import { motion } from "framer-motion";

type HeroProps = {
  title: string;
  subtitle: string;
  image: string;
};

export function Hero({ title, subtitle, image }: HeroProps) {
  return (
    <section className="relative h-[65vh] min-h-[430px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.22), rgba(0,0,0,0.62)), url(${image})`,
        }}
      />
      <div className="container-premium relative flex h-full items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl text-white"
        >
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/80">
            Featured Story
          </p>
          <h1 className="font-serif text-4xl leading-tight md:text-6xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-white/85 md:text-lg">{subtitle}</p>
        </motion.div>
      </div>
    </section>
  );
}
