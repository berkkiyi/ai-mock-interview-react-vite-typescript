import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/config/firebase.config";
import { Interview } from "@/types";
import { useAuth } from "@clerk/clerk-react";
import { error } from "console";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Dashboard = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setloading] = useState(false);
  const { userId } = useAuth();

  useEffect(() => {
    setloading(true);
    const interviewQuery = query(
      collection(db, "interviews"),
      where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(
      interviewQuery,
      (snapshot) => {
        const interviewList: Interview[] = snapshot.docs.map((doc) => {
          const id = doc.id;
          return {
            id,
            ...doc.data(),
          };
        }) as Interview[];
        setInterviews(interviewList);
        setloading(false);
      },
      (error) => {
        console.log("Error on fetching : ", error);
        toast.error("Error..", {
          description: "SOmething went wrong.. Try again later..",
        });
        setloading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);
  return (
    <>
      <div className="flex w-full items-center justify-between ">
        {/* heading section */}
        <Heading
          title="Dashboard"
          description="Create and start your interview."
        />
        <Link to={"/generate/create"}>
          <Button size={"sm"}>
            <Plus /> Add New
          </Button>
        </Link>
      </div>
      <Separator className="my-8" />

      {/* content section */}

      <div className="md:grid md:grid-cols-3 gap-3 py-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-24 md:h-32 rounded-md" />
          ))
        ) : interviews.length > 0 ? (
          interviews.map((interview) => (
            <p key={interview.id}>{interview.position}</p>
          ))
        ) : (
          <div></div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
