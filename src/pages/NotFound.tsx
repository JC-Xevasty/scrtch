import useHead from "../hooks/useHead";

const NotFound = () => {
    useHead({ title: "Page Not Found" });

    return (
        <div className="w-full h-full flex flex-col justify-center items-center p-4 select-none">
            <h1 className="font-bold text-[200px] leading-none tracking-normal">404</h1>
            <p className="font-bold text-4xl">Page Not Found</p>
        </div>
    );
};

export default NotFound;
