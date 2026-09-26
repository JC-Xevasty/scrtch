import { useEffect } from "react";

const useUnsavedChanges = (enabled: boolean = true) => {
    useEffect(() => {
        if (!enabled) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            // Trigger the native browser confirmation dialog
            e.preventDefault();
        }

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [enabled])
}

export default useUnsavedChanges;