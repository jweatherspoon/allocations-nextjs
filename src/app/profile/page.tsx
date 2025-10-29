import { auth0 } from '@/app/lib/auth/auth0';

export default async function ProfilePage() {
  const session = await auth0.getSession();
  console.log('User session:', session);

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
              {session?.user && (
                <div className="flex items-start gap-6">
                  {session.user.picture && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={session.user.picture}
                      alt={session.user.name || 'User'}
                      className="w-20 h-20 rounded-full"
                    />
                  )}
                  <div className="space-y-2">
                    {session.user.name && (
                      <div>
                        <span className="font-semibold">Name: </span>
                        <span>{session.user.name}</span>
                      </div>
                    )}
                    {session.user.nickname && (
                      <div>
                        <span className="font-semibold">Nickname: </span>
                        <span>{session.user.nickname}</span>
                      </div>
                    )}
                    {session.user.email && (
                      <div>
                        <span className="font-semibold">Email: </span>
                        <span>{session.user.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
            <div>
              <a href='/auth/logout' className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-center block">
                  Logout
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
