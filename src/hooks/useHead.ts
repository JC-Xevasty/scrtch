import { useEffect } from "react";

interface PropTypes {
    title?: string;
    description?: string;
    bodyClass?: string;
}

const useHead = ({
    title = "Scratch Pad",
    description,
    bodyClass,
}: PropTypes) => {
    useEffect(() => {
        // Handle tab title
        if (title) {
            document.title = title !== "scrtch"
                ? `${title} | scrtch`
                : title;
        }

        // Handle Meta Description
        if (description) {
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement("meta");
                metaDesc.setAttribute("name", "description");
                document.head.appendChild(metaDesc);
            }
            metaDesc.setAttribute("content", description);
        }

        // Handle Body Class (e.g., for different page backgrounds)
        if (bodyClass) {
            document.body.classList.add(bodyClass);
            return () => document.body.classList.remove(bodyClass);
        }
    }, [title, description, bodyClass]);
};

export default useHead;
