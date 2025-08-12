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
      value: stats.totalRecords.toLocaleString(),
      icon: BookOpen,
      color: "bg-blue-500",
      description: "Total bibliography entries"
    },
    {
      name: "This Year",
      value: stats.thisYear.toLocaleString(),
      icon: Calendar,
      color: "bg-green-500",
      description: "Publications added this year"
    },
    {
      name: "Languages",
      value: stats.languages.toString(),
      icon: Globe,
      color: "bg-purple-500",
      description: "Different languages covered"
    },
    {
      name: "Countries",
      value: stats.countries.toString(),
      icon: MapPin,
      color: "bg-orange-500",
      description: "Countries represented"
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.name}
            className="group relative overflow-hidden rounded-xl bg-white px-6 py-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200"
          >
            {/* Background accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${item.color} opacity-5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-300`}></div>
            
            <div className="relative">
              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl ${item.color} shadow-sm mb-4`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              
              {/* Content */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">
                  {item.name}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {item.value}
                </p>
                <p className="text-xs text-gray-500">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
