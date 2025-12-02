import './Skeleton.css';

interface SkeletonProps {
    width?: string;
    height?: string;
    borderRadius?: string;
    className?: string;
}

const Skeleton = ({ width, height, borderRadius, className = '' }: SkeletonProps) => {
    const style = {
        width,
        height,
        borderRadius,
    };

    return <div className={`skeleton ${className}`} style={style}></div>;
};

export default Skeleton;
