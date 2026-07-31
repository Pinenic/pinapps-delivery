"use client";

import { ChevronDown } from "lucide-react";
import { Plus } from "lucide-react";
import { Calendar } from "lucide-react";
import { ArrowDownIcon } from "lucide-react";
import { User2 } from "lucide-react";
const STATUS_STYLES = {
  pending: "bg-gray-100 text-gray-700",
  active: "bg-blue-100 text-blue-700",
  picked_up: "bg-yellow-100 text-yellow-700",
  in_transit: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  up: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  down: "bg-red-100 text-red-700",
};

const ORDERS = [
  {
    id: "2318",
    customer: "John Smith",
    status: "in_transit",
    eta: "12:43PM",
  },
  {
    id: "2317",
    customer: "Sarah John",
    status: "delivered",
    eta: "2:43PM",
  },
  {
    id: "2316",
    customer: "Michael",
    status: "pending",
    eta: "1:40PM",
  },
  {
    id: "2315",
    customer: "Emily Davies",
    status: "delivered",
    eta: "completed",
  },
  {
    id: "2314",
    customer: "David Wilson",
    status: "cancelled",
    eta: "cancelled",
  },
];

const getStatusStyles = (status) => {
  if (!status) return "bg-gray-100 text-gray-700";

  const normalized = status.toLowerCase().trim();

  return (
    STATUS_STYLES[normalized] || "bg-gray-100 text-gray-700" // fallback style
  );
};

function KPI({ title, value, rate, range, theme }) {
  return (
    <div className="flex flex-col gap-2 min-w-xs shadow-xs p-4 px-5 rounded-3xl bg-white/50 backdrop-blur-md">
      <div className="flex font-medium text-sm">Title comes here</div>
      <div className="flex justify-between">
        <div className="text-xl">128</div>
        <div className="border-b-2 text-center px-2 font-medium">0.0%</div>
      </div>
      <p className="text-xs text-muted-foreground">vs last month</p>
    </div>
  );
}

function Leaderboard() {
  return (
    <div className="gap-2 min-w-xs shadow-xs p-4 px-5 rounded-3xl bg-white/50 backdrop-blur-md">
      <div className="flex justify-between items-center">
        <h2 className="font-medium">Top Performing Riders</h2>
        <p className="text-xs color ">View all</p>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="flex gap-3">
          <User2 className="border rounded-full p-1 h-9 w-9" />
          <div className="flex flex-col justify-between">
            <p className=" text-sm font-semibold">Chanda Mwansa</p>
            <p className="text-sm font-light text-gray-500">AID-345</p>
          </div>
        </div>
        <p className={`text-xs ${STATUS_STYLES.active} px-1 rounded`}>95.8%</p>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="flex gap-3">
          <User2 className="border rounded-full p-1 h-9 w-9" />
          <div className="flex flex-col justify-between">
            <p className=" text-sm font-semibold">Brian Chola</p>
            <p className="text-sm font-light text-gray-500">ADS-425</p>
          </div>
        </div>
        <p className={`text-xs ${STATUS_STYLES.active} px-1 rounded`}>93.5%</p>
      </div>
    </div>
  );
}

function Chart() {
  return (
    <div className="flex flex-col shadow-xs p-4 px-5 min-h-lg min-w-lg rounded-3xl bg-white/80 backdrop-blur-md">
      <div className="flex w-full justify-between">
        <h2 className="font-medium">Delivery Overview</h2>
        <p className="flex gap-2 items-center text-sm">
          Month <ChevronDown className="h-4" />
        </p>
      </div>
    </div>
  );
}

function Table() {
  return (
    <div className="flex flex-col shadow-xs p-4 px-5 w-full rounded-3xl bg-white/80 backdrop-blur-md">
      <div className="flex w-full justify-between items-center">
        <h2 className="font-medium">Recent Orders</h2>
        <p className="flex gap-2 items-center text-sm">View all</p>
      </div>
      <table className="mt-3">
        <tbody>
          <tr className="text-xs text-muted-foreground">
            <td>Order ID</td>
            <td>Customer</td>
            <td>Status</td>
            <td>ETA</td>
          </tr>
          {ORDERS.map((order) => (
            <tr className="p-3 m-auto text-sm font-medium text-gray-500">
              <td className="px-2 py-4">#ORD-{order.id}</td>
              <td>{order.customer}</td>
              <td className="">
                <p
                  className={`text-sm w-fit ${getStatusStyles(
                    order.status
                  )} px-2 rounded`}
                >
                  {order.status}
                </p>
              </td>
              <td>{order.eta}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Page() {
  return (
    <div className="flex h-[91vh]">
      <section className="flex flex-col justify-between">
        <div className="p-4 space-y-2">
          <h1 className="text-2xl">Welcome Back, Admin</h1>
          <p className="text-xs">
            Here's what's happening with your deliveries today
          </p>
        </div>
        <div className="flex flex-col gap-2 px-2 mt-2">
          <KPI />
          <KPI />
          <KPI />
          <Leaderboard />
        </div>
      </section>
      <section className="flex flex-col justify-between w-full">
        <div className="flex items-center p-2 py-5 gap-8 justify-end">
          <div className="flex font-medium text-sm gap-1">
            <Calendar size={14} />
            <p>Jul 23 - Jul 30</p>
          </div>
          <button className="flex gap-2 p-2 bg-[#D4A017] rounded-full">
            {" "}
            <Plus size={20} /> Create Delivery
          </button>
        </div>
        <div className="flex gap-2">
          <Chart />
          <Table />
        </div>
      </section>
    </div>
  );
}
