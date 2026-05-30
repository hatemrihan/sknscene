'use client';

export default function Header() {
    return (
        <section className="relative w-full h-screen min-h-[600px] overflow-hidden bg-stone-950">
            {/* Laptop / Desktop Video */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover hidden md:block"
                draggable={false}
            >
                <source src="/videos/home.mp4" type="video/mp4" />
            </video>

            {/* Mobile Video */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover md:hidden"
                draggable={false}
            >
                <source src="/videos/mobile.mp4" type="video/mp4" />
            </video>
        </section>
    );
}
