"use client";
import ShineText from "./ShineText";
export default function ShineTextUsage(props) {
    return (<div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
            <ShineText text={props.text || "Premium Shine Effect"} className={props.className || "text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight"} baseColor={props.baseColor || "#333333"} shineColor={props.shineColor || "#ffffff"} shineWidth={props.shineWidth ?? 150} speed={props.speed ?? 0.8} direction={props.direction || "left-to-right"}/>
        </div>);
}
