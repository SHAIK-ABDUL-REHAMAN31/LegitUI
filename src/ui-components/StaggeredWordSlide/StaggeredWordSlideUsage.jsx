import StaggeredWordSlide from "./StaggeredWordSlide";

const StaggeredWordSlideUsage = (props) => {
    return (
        <div style={{ background: props.backgroundColor || "#000000", minHeight: "100vh" }}>
            <StaggeredWordSlide {...props} />
        </div>
    );
};

export default StaggeredWordSlideUsage;