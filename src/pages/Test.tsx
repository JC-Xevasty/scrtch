import { useState } from "react";
import TextBlock from "../components/TextBlock";
import { useTheme } from "../context/theme/ThemeContext";

const Test = () => {
    const { setTheme, resolvedTheme } = useTheme();
    const [value, setValue] = useState("");
    return (
        <>
            <div
                className="fixed top-4 right-4 bg-background-2 border border-white/10 shadow-md p-4 rounded text-center cursor-pointer"
                onClick={() => {
                    if (resolvedTheme === "light") setTheme("dark");
                    if (resolvedTheme === "dark") setTheme("light");
                }}
            >
                <p className="text-foreground-primary text-sm">CURRENT THEME: {resolvedTheme}</p>
                <p className="text-foreground-secondary text-xs">Click to toggle</p>
            </div>

            {/* Level 0: Flat level */}
            <div className="mb-4">
                <h1 className="text-foreground-primary text-2xl font-bold">Primary Title (L0)</h1>
                <p className="text-foreground-secondary">
                    This is secondary text and a{" "}
                    <span className="text-accent font-semibold cursor-pointer underline decoration-2 underline-offset-4">
                        link text
                    </span>{" "}
                    explaining a feature.
                </p>
                <span className="text-foreground-muted text-xs uppercase tracking-widest font-bold">
                    Created: April 2026
                </span>
            </div>

            {/* Level 1: Sidebar/Card style */}
            <div className="bg-background-1 border border-white/5 shadow-sm p-4 rounded my-4">
                <h1 className="text-foreground-primary text-2xl font-bold">Primary Title (L1)</h1>
                <p className="text-foreground-secondary">
                    This is secondary text and a{" "}
                    <span className="text-accent font-semibold cursor-pointer underline decoration-2 underline-offset-4">
                        link text
                    </span>{" "}
                    explaining a feature.
                </p>
                <span className="text-foreground-muted text-xs uppercase tracking-widest font-bold">
                    Created: April 2026
                </span>
            </div>

            {/* Level 2: An "Elevated" item */}
            <div className="bg-background-2 border border-white/10 shadow-md p-4 rounded mb-4">
                <h1 className="text-foreground-primary text-2xl font-bold">Primary Title (L2)</h1>
                <p className="text-foreground-secondary">
                    This is secondary text and a{" "}
                    <span className="text-accent font-semibold cursor-pointer underline decoration-2 underline-offset-4">
                        link text
                    </span>{" "}
                    explaining a feature.
                </p>
                <span className="text-foreground-muted text-xs uppercase tracking-widest font-bold">
                    Created: April 2026
                </span>
            </div>

            {/* Level 3: The Popup/Modal */}
            <div className="bg-background-3 border border-white/20 shadow-xl p-6 rounded-lg mb-4">
                <h1 className="text-foreground-primary text-2xl font-bold">Primary Title (L3)</h1>
                <p className="text-foreground-secondary">
                    This is secondary text and a{" "}
                    <span className="text-accent font-semibold cursor-pointer underline decoration-2 underline-offset-4">
                        link text
                    </span>{" "}
                    explaining a feature.
                </p>
                <span className="text-foreground-muted text-xs uppercase tracking-widest font-bold">
                    Created: April 2026
                </span>
            </div>

            <div className="space-y-6 mb-4">
                <div className="flex flex-wrap gap-6 items-center">
                    {/* Standard State */}
                    <div className="flex flex-col gap-2">
                        <span className="text-xs text-foreground-muted uppercase font-bold">Normal</span>
                        <button className="bg-accent hover:bg-accent-hover active:bg-accent-active text-white px-6 py-2 rounded-md font-bold transition-colors">
                            PRIMARY
                        </button>
                    </div>

                    {/* Ghost Hover State */}
                    <div className="flex flex-col gap-2">
                        <span className="text-xs text-foreground-muted uppercase font-bold">Ghost Hover</span>
                        <button className="border border-accent text-accent hover:bg-accent/10 px-6 py-2 rounded-md font-bold transition-all">
                            GHOST
                        </button>
                    </div>

                    {/* Disabled State */}
                    <div className="flex flex-col gap-2">
                        <span className="text-xs text-foreground-muted uppercase font-bold">Disabled</span>
                        <button
                            disabled
                            className="bg-accent opacity-40 grayscale cursor-not-allowed text-white px-6 py-2 rounded-md font-bold"
                        >
                            DISABLED
                        </button>
                    </div>
                </div>

                {/* Input Field Focus Test */}
                <div className="max-w-xs space-y-2">
                    <label className="text-sm text-foreground-secondary font-medium">Input field</label>
                    <input
                        type="text"
                        placeholder="Type something..."
                        className="w-full bg-background-1 border border-background-3 px-4 py-2 rounded-md outline-none focus:ring-0 focus:ring-accent focus:border-accent transition-all text-foreground-primary"
                    />
                </div>

                <div className="max-w-xs space-y-2">
                    <label className="text-sm text-foreground-secondary font-medium">Textarea field</label>
                    <textarea
                        className="w-full bg-background-1 border border-background-3 px-4 py-2 rounded-md outline-none focus:ring-0 focus:ring-accent focus:border-accent transition-all text-foreground-primary"
                        defaultValue="Type something..."
                        placeholder="Type something..."
                    ></textarea>
                </div>

                <div className="max-w-xs space-y-2">
                    <label className="text-sm text-foreground-secondary font-medium">Text BLOCK</label>
                    <TextBlock value={value} onChange={(e) => setValue(e.target.value)} placeholder="asdas dsadsadsa" />
                </div>
            </div>

            <div className="space-y-10">
                {/* Buttons Section */}
                <div className="flex gap-4">
                    {/* SOLID */}
                    <button className="bg-success hover:opacity-90 text-white px-6 py-2 rounded-md font-bold shadow-md">
                        SUCCESS
                    </button>
                    <button className="bg-error hover:opacity-90 text-white px-6 py-2 rounded-md font-bold shadow-md">
                        ERROR
                    </button>

                    {/* GHOST */}
                    <button className="text-success border border-success/20 hover:bg-success/10 px-6 py-2 rounded font-bold transition-colors">
                        SUCCESS
                    </button>

                    <button className="text-error border border-error/20 hover:bg-error/10 px-6 py-2 rounded font-bold transition-colors">
                        ERROR
                    </button>
                </div>

                {/* Message Boxes / Toasts */}
                <div className="space-y-4 max-w-md">
                    {/* Success Box */}
                    <div className="bg-success-soft border border-success/30 p-4 rounded-lg flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <p className="text-success text-sm font-medium">This is a success message.</p>
                    </div>

                    {/* Error Box */}
                    <div className="bg-error-soft border border-error/30 p-4 rounded-lg flex items-center gap-3">
                        <span className="text-error font-bold text-lg">!</span>
                        <p className="text-error text-sm font-medium">This is an error message.</p>
                    </div>

                    <div className="bg-background-3 border border-white/20 p-4 rounded-lg flex items-center gap-3">
                        <span className="text-foreground-primary font-bold text-lg">!</span>
                        <p className="text-foreground-primary text-sm font-medium">This is a default message.</p>
                    </div>

                    <div className="bg-accent/10 border border-accent p-4 rounded-lg flex items-center gap-3">
                        <span className="text-foreground-primary font-bold text-lg">i</span>
                        <p className="text-foreground-primary text-sm font-medium">This is a default message.</p>
                    </div>
                </div>
            </div>
            <br />
            <hr />
            <br />
        </>
    );
};
export default Test;
