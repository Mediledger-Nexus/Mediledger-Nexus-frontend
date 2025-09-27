"use client";

import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { BackgroundVideo } from "@/components/background-video";
import { motion } from "framer-motion";
import { PhoneLogin } from "@/components/auth/PhoneLogin";

export default function PatientLoginPage() {
  const router = useRouter();

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" },
  };

  const handleSuccess = (user: any) => {
    // After phone verification, continue through the unified auth flow
    router.push("/auth");
  };

  const handleError = (message: string) => {
    // PhoneLogin may call onError('') to clear previous errors; ignore empty messages
    if (!message) return;
    console.error("Patient login error:", message);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navigation />

      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <BackgroundVideo
          src="/carbon-fiber-dots.gif"
          alt="Carbon fiber texture with subtle dot pattern"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black/90" />

        <motion.div
          className="relative z-10 max-w-md mx-auto px-6 w-full"
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.div
            className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50"
            variants={fadeInUp}
          >
            <div className="text-center mb-6">
              <motion.h1
                className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
                variants={fadeInUp}
              >
                Patient Sign In
              </motion.h1>
              <motion.p className="text-gray-300 text-sm" variants={fadeInUp}>
                Verify your phone number to continue
              </motion.p>
            </div>

            <PhoneLogin onSuccess={handleSuccess} onError={handleError} />
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
