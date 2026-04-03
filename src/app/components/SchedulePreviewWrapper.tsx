import { getSchedulePreview } from "@/lib/schedule.server";
import SchedulePreviewClient from "./SchedulePreviewClient";

export default async function SchedulePreviewWrapper() {
    const items = await getSchedulePreview();
    return <SchedulePreviewClient items={items} />;
}