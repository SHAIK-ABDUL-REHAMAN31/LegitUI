import SmoothFadeUp from "./SmoothFadeUp";

export default function SmoothFadeUpUsage() {
    return (
        <SmoothFadeUp
            heading={[
                "Discover the Unknown",
                "Explore infinite possibilities"
            ]}
            subheading={null}
            description={null}
            badge={null}
            distance={50}
            duration={1.2}
            stagger={0.12}
            ease="power2.out"
            scrub={false}
            showButtons={false}
            showDivider={false}
        />
    );
}
