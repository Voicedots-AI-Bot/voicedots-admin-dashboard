import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";

const DashboardLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r p-6">
        <h2 className="text-xl font-semibold mb-6">VoiceDots</h2>
        <button
          onClick={() => navigate("/dashboard/conversations")}
          className="block w-full text-left"
        >
          💬 Conversations
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 bg-gray-50">
        <div className="h-14 bg-white border-b flex justify-end items-center px-6">
          <Button
            size="sm"
            radius="full"
            variant="bordered"
            onClick={() => navigate("/login")}
          >
            Logout
          </Button>
        </div>

        <div className="p-6 overflow-auto h-[calc(100%-56px)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
