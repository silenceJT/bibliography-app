import { BookOpen, Calendar, Globe, MapPin } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    totalRecords: number;
    thisYear: number;
    languages: number;
    countries: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      name: "Total Records",
      value: stats.totalRecords.toString(),
      icon: BookOpen,
    },
    {
      name: "This Year",
      value: stats.thisYear.toString(),
      icon: Calendar,
    },
    {
      name: "Languages",
      value: stats.languages.toString(),
      icon: Globe,
    },
    {
      name: "Countries",
      value: stats.countries.toString(),
      icon: MapPin,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6"
          >
            <dt>
              <div className="absolute rounded-md bg-indigo-500 p-3">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">
                {item.value}
              </p>
            </dd>
          </div>
        );
      })}
    </div>
  );
}
