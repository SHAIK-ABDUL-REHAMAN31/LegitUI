import PixelifyText from "./PixelifyText";

const PixelifyTextUsage = () => {
    return (
        <div style={{ background: "#ffffffff", minHeight: "100vh" }}>
            <section className="w-full min-h-screen flex flex-col items-center justify-center bg-[#ffffffff]">
                <PixelifyText
                    text="CREATIVE"
                    gridSize={8}
                    fontSize={100}
                    color="#337eff"
                    delay={1}
                    duration={1.5}
                />
                <PixelifyText
                    text="DEVELOPER"
                    gridSize={8}
                    fontSize={100}
                    color="#000000ff"
                    delay={1.5}
                    duration={1.5}
                />
            </section>
        </div>
    );
};

export default PixelifyTextUsage;