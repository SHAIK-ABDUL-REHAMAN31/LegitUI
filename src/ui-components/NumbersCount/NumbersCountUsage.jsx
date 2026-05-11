"use client";

import NumberCountMotion from "./NumbersCount";
import styles from "./NumbersCount.module.css";

export default function Home() {
    return (
        <main className="flex flex-col min-h-screen bg-white text-black overflow-hidden font-sans">
            {/* Hero Section */}
            <section className="relative w-full h-screen flex flex-col items-center justify-center text-center px-4">
                <div className="z-10 flex flex-col items-center max-w-6xl w-full">

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6  opacity-0 animate-fade-in"
                        style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>

                        <div className={styles.countWrapper}>
                            <span className={styles.label}>Global Users</span>
                            <NumberCountMotion end={842} />
                        </div>

                        <div className={styles.countWrapper}>
                            <span className={styles.label}>Data Processed</span>
                            <NumberCountMotion end={12500} />
                        </div>

                        <div className={styles.countWrapper}>
                            <span className={styles.label}>Success Rate</span>
                            <NumberCountMotion end={99.9} decimals={1} />
                        </div>
                    </div>
                </div>
            </section>

            <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
        </main >
    );
}
