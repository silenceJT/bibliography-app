import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Bibliography Database
      </h1>
      <p className="text-center text-lg text-muted-foreground mb-12">
        Modern bibliography management system
      </p>

      <div className="flex justify-center space-x-4">
        <Link
          href="/auth/login"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium"
        >
          Sign In
        </Link>
        <Link
          href="/auth/register"
          className="bg-white hover:bg-gray-50 text-indigo-600 border border-indigo-600 px-6 py-3 rounded-md font-medium"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}
