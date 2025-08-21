import WellnessFrame from '@/components/farcaster/WellnessFrame';

export const metadata = {
  title: 'WellSpace - Farcaster Frame',
  description: 'Track your wellness journey on Farcaster',
  openGraph: {
    title: 'WellSpace - Wellness Tracker',
    description: 'Track your daily activities, meals, and wellness goals',
    images: ['/hero.png'],
  },
};

export default function FarcasterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-600 mb-2">WellSpace</h1>
          <p className="text-xl text-gray-600">Your Wellness Journey on Farcaster</p>
        </div>
        
        <WellnessFrame />
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Built with ❤️ for the Farcaster community</p>
          <p className="mt-2">
            <a 
              href="https://wellspace.app" 
              className="text-green-600 hover:text-green-700 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit WellSpace.app
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
