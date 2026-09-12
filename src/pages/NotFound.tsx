import useHead from "../hooks/useHead";

const NotFound = () => {
    useHead({ title: "Page Not Found" });
    return <div>NotFound</div>;
};
export default NotFound;
