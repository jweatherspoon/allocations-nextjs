import { auth0 } from '@/api/auth/auth0.api';
import TitledPageContainer from '@/components/shared/containers/pages/titled-page-container';
import DetailsSectionContainer from '@/components/shared/containers/sections/details-section-container';

export default async function ProfilePage() {
  const session = await auth0.getSession();

  return (
    <TitledPageContainer
      title='Profile & Settings'
      subtitle='Manage your account settings and preferences.'
    >
      <div className='space-y-6'>
        {/* Profile Section */}
        <DetailsSectionContainer>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>
            Profile Information
          </h2>
          <div className='text-gray-600'>
            {session?.user && (
              <div className='flex items-start gap-6'>
                {session.user.picture && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.picture}
                    alt={session.user.name || 'User'}
                    className='w-20 h-20 rounded-full'
                  />
                )}
                <div className='space-y-2'>
                  {session.user.name && (
                    <div>
                      <span className='font-semibold'>Name: </span>
                      <span>{session.user.name}</span>
                    </div>
                  )}
                  {session.user.nickname && (
                    <div>
                      <span className='font-semibold'>Nickname: </span>
                      <span>{session.user.nickname}</span>
                    </div>
                  )}
                  {session.user.email && (
                    <div>
                      <span className='font-semibold'>Email: </span>
                      <span>{session.user.email}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DetailsSectionContainer>

        {/* Settings Section */}
        <DetailsSectionContainer>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>Settings</h2>
          <div className='text-gray-600'>
            <p>Application settings coming soon.</p>
          </div>
        </DetailsSectionContainer>

        {/* Preferences Section */}
        <DetailsSectionContainer>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>
            Preferences
          </h2>
          <div className='text-gray-600'>
            <p>User preferences coming soon.</p>
          </div>
        </DetailsSectionContainer>

        {/* Logout Section */}
        <div>
          <a
            href='/auth/logout'
            className='w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-center block'
          >
            Logout
          </a>
        </div>
      </div>
    </TitledPageContainer>
  );
}
