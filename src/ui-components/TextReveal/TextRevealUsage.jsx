import ScrollWipeText from "./TextReveal";

export default function TextRevealUsage() {
    return (
        <div style={{ width: '100%', position: 'relative', background: '#09090b' }}>
            {/* Push content way down so user HAS to scroll */}
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#52525b' }}>
                Scroll down ↓
            </div>

            <ScrollWipeText
                text="Scroll to reveal"
                activeColor="#ffffff"
                inactiveColor="#3f3f46"
                opacityStart={0.2}
                opacityEnd={1}
            />

            <div style={{ height: '100vh' }}></div>
        </div>
    );
}