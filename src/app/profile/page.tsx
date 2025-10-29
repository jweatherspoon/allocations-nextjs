export default async function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile & Settings</h1>
          <p className="text-gray-600 mb-8">
            Manage your account settings and preferences.
          </p>

            <div className="space-y-6">
            {/* Profile Section */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
              <div className="text-gray-600">
              <p>Profile management coming soon.</p>
              </div>
            </div>

            {/* Settings Section */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings</h2>
              <div className="text-gray-600">
              <p>Application settings coming soon.</p>
              </div>
            </div>

            {/* Preferences Section */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferences</h2>
              <div className="text-gray-600">
              <p>User preferences coming soon.</p>
              </div>
            </div>

            {/* Logout Section */}
            {/* <div>
              <form action={logout}>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
                </form>
              </div> */}
            </div>
        </div>
      </div>
    </div>
  );
}
