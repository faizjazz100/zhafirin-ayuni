import FloralCorner from "@/src/app/components/FloralCorner";

export default function PageContainer({
    children,
    floral = false,
}: {
    children: React.ReactNode;
    floral?: boolean;
}) {
    return (
        <div className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:px-6 sm:pt-14">
            <div className="relative">
                {floral ? <FloralCorner /> : null}
                {children}
            </div>
        </div>
    );
}