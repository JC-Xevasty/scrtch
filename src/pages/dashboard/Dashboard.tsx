import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Dropdown from "../../components/Dropdown";
import TextButton from "../../components/TextButton";
import Icon from "../../components/Icon";

import CollectionListItem from "../../components/dashboard/CollectionListItem";
import ContentListItem from "../../components/dashboard/ContentListItem";
import ContentGridItem from "../../components/dashboard/ContentGroupItem";

import useHead from "../../hooks/useHead";
import { useDashboardPinned, useDashboardStats, useRecentActivity } from "../../hooks/dashboard/useDashboard";

const Dashboard = () => {
    useHead({ title: "Dashboard" });
    const navigate = useNavigate();
    const { data: stats, isLoading: isStatsLoading, error: statsError } = useDashboardStats();
    const { data: pinnedItems, isLoading: isPinnedLoading, error: pinnedError } = useDashboardPinned();
    const { data: recent, isLoading: isRecentLoading, error: recentError } = useRecentActivity();

    const isLoading = isStatsLoading || isPinnedLoading || isRecentLoading;

    const [view, setView] = useState("list");

    return (
        <div>
            <div className="flex flex-row justify-between items-center py-8 -mt-4 sticky -top-4 bg-background-0 border-b-2 border-background-3">
                <div className="font-medium flex items-center gap-4">
                    <h1 className="text-4xl align-middle uppercase">OVERVIEW</h1>
                </div>
                <Dropdown
                    trigger={
                        <TextButton disabled={isLoading}>
                            <span className="capitalize">New Content</span>
                        </TextButton>
                    }
                    onChange={(selected) => {
                        navigate(`/${selected.value}/new`, { state: { from: "/dashboard", fromName: "Dashboard " } });
                    }}
                    options={[
                        { id: "notes", value: "notes", text: "New Note" },
                        { id: "lists", value: "lists", text: "New List" },
                        { id: "logs", value: "logs", text: "New Log" },
                    ]}
                />
            </div>
            <br />
            {isLoading ? (
                <p>Loading....</p>
            ) : (
                <>
                    {statsError || !stats ? (
                        <div className="bg-error-soft border border-error/30 text-error p-4 rounded-lg flex justify-between items-center w-full mb-8">
                            <p className="text-center">Failed to load dashboard stats: {statsError?.message}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 gap-4 mb-4">
                            <div className=" bg-background-2 border border-white/10 shadow-md p-4 rounded hover:bg-background-3 hover:border-white/20 cursor-pointer">
                                <div className="flex flex-col gap-2 items-center">
                                    <p className="font-bold text-5xl">{stats.notes.count}</p>
                                    <span>Notes</span>
                                </div>
                            </div>
                            <div className=" bg-background-2 border border-white/10 shadow-md p-4 rounded hover:bg-background-3 hover:border-white/20 cursor-pointer">
                                <div className="flex flex-col gap-2 items-center">
                                    <p className="font-bold text-5xl">{stats.lists.count}</p>
                                    <span>Lists</span>
                                </div>
                            </div>
                            <div className=" bg-background-2 border border-white/10 shadow-md p-4 rounded hover:bg-background-3 hover:border-white/20 cursor-pointer">
                                <div className="flex flex-col gap-2 items-center">
                                    <p className="font-bold text-5xl">{stats.logs.count}</p>
                                    <span>Logs</span>
                                </div>
                            </div>
                            <div className=" bg-background-2 border border-white/10 shadow-md p-4 rounded hover:bg-background-3 hover:border-white/20 cursor-pointer">
                                <div className="flex flex-col gap-2 items-center">
                                    <p className="font-bold text-5xl">{stats.links.link_count}</p>
                                    <span>Links</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <br />
                    <h2 className="text-2xl font-medium border-b-4 border-background-3 pb-2 px-3 capitalize mb-4">
                        Quick Access
                    </h2>
                    {pinnedError || !pinnedItems ? (
                        <div className="bg-error-soft border border-error/30 text-error p-4 rounded-lg flex justify-between items-center w-full mb-8">
                            <p className="text-center">Failed to load pinned items: {pinnedError?.message}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h2 className="font-medium border-b-4 border-background-3 pb-2 px-3 capitalize mb-4">
                                    Pinned Items
                                </h2>
                                {pinnedItems.content.length === 0 && (
                                    <p className="text-center text-foreground-muted text-sm font-semibold select-none capitalize">
                                        No pinned items
                                    </p>
                                )}
                                {pinnedItems.content.length > 0 && (
                                    <div>
                                        {pinnedItems.content.map((item) => {
                                            return (
                                                <ContentListItem
                                                    key={item.id}
                                                    {...item}
                                                    cameFrom="Dashboard"
                                                    showType
                                                    showGroup
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h2 className="font-medium border-b-4 border-background-3 pb-2 px-3 capitalize mb-4">
                                    Pinned Groups
                                </h2>
                                {pinnedItems.groups.length === 0 && (
                                    <p className="text-center text-foreground-muted text-sm font-semibold select-none capitalize">
                                        No pinned groups
                                    </p>
                                )}
                                {pinnedItems.groups.length > 0 && (
                                    <div>
                                        {pinnedItems.groups.map((group) => {
                                            return (
                                                <CollectionListItem
                                                    key={group.id}
                                                    collectionName={"groups"}
                                                    itemId={group.id}
                                                    itemName={group.title}
                                                    updatedAt={group.updated_at}
                                                    showGroup={false}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <br />
                    <br />
                    <div className="border-b-4 border-background-3 pb-2 px-3 mb-4 flex flex-row justify-between items-center">
                        <h2 className="text-2xl font-medium capitalize">Recents</h2>
                        <div className="flex items-center gap-2">
                            <div onClick={() => setView("list")}>
                                <Icon
                                    name="view-list"
                                    size={16}
                                    className="cursor-pointer"
                                    color={view === "list" ? "text-accent" : "text-foreground-secondary"}
                                />
                            </div>
                            <div onClick={() => setView("grid")}>
                                <Icon
                                    name="view-grid"
                                    size={18}
                                    className="cursor-pointer"
                                    color={view === "grid" ? "text-accent" : "text-foreground-secondary"}
                                />
                            </div>
                        </div>
                    </div>

                    {recentError || !recent ? (
                        <div className="bg-error-soft border border-error/30 text-error p-4 rounded-lg flex justify-between items-center w-full mb-8">
                            <p className="text-center">Failed to load recent items: {recentError?.message}</p>
                        </div>
                    ) : (
                        <>
                            {recent.length === 0 && (
                                <p className="text-center text-foreground-muted text-sm font-semibold select-none capitalize">
                                    No recent items
                                </p>
                            )}
                            {recent.length > 0 && view === "grid" && (
                                <div className="grid grid-cols-4 gap-4">
                                    {recent.map((item) => {
                                        return (
                                            <ContentGridItem
                                                key={item.id}
                                                {...item}
                                                cameFrom="Dashboard"
                                                showType
                                                showGroup
                                            />
                                        );
                                    })}
                                </div>
                            )}

                            {recent.length > 0 && view === "list" && (
                                <div className="-mt-4">
                                    {recent.map((item) => {
                                        return (
                                            <ContentListItem
                                                key={item.id}
                                                {...item}
                                                cameFrom="Dashboard"
                                                showType
                                                showGroup
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default Dashboard;
