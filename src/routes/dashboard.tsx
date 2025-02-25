import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
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
    </>
  );
};

export default Dashboard;
