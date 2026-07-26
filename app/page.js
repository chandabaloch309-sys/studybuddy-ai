export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          StudyBuddy AI
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your smart AI-powered study planner for university students.
          Organize assignments, track progress, and get personalized study plans.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition"
          >
            Login
          </a>
          <a
            href="/register"
            className="bg-white hover:bg-gray-100 text-blue-600 font-semibold py-3 px-8 rounded-lg border border-blue-600 transition"
          >
            Register
          </a>
        </div>
      </div>
    </main>
  );
}