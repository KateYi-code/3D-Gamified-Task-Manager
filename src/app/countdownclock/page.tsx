import { CountDownClock } from "@/components/task/CountDownClock";

export default function CountDownPage() {
    return (
        <div className="flex justify-center items-center h-screen">
            <CountDownClock size={300} />
        </div>
    );
}