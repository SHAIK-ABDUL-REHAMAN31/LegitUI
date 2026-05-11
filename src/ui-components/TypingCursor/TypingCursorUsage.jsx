import TypingCursor from "./TypingCursor";

export default function Home() {
    return (
        <main className="flex flex-col min-h-screen bg-white">
            <section className="w-full h-screen flex flex-col items-center justify-center text-center px-4">
                <TypingCursor
                    text="Introducing LegitUI"
                    fontSize="clamp(2rem, 6vw, 4rem)"
                />
                {/* <div className="mt-4">
                    <TypingCursor
                        text="Crafting high-performance, cinematic web experiences."
                        fontSize="clamp(0.875rem, 1.5vw, 1.25rem)"
                        typingSpeed={0.02}
                        delay={1.2}
                        className="opacity-60 font-medium"
                    />
                </div> */}

                {/* <button className="mt-10 px-6 py-2.5 bg-black text-white rounded-full text-sm font-medium transition-transform hover:scale-105 active:scale-95">
                    View Projects
                </button> */}
            </section>
        </main>
    );
}
