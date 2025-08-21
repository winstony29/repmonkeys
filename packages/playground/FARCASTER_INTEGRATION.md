# 🚀 Farcaster Integration Guide for WellSpace

## Overview
This guide explains how to integrate your WellSpace wellness app with Farcaster, enabling users to track their wellness journey directly from Farcaster frames.

## 🏗️ What's Already Built

Your project already includes:
- ✅ Farcaster MiniApp SDK (`@farcaster/miniapp-sdk`)
- ✅ Webhook handler for frame events
- ✅ Notification system for Farcaster users
- ✅ Basic frame configuration
- ✅ Wellness tracking components

## 🔧 Step-by-Step Setup

### 1. Environment Configuration

Add these variables to your `.env` file:

```bash
# Farcaster Configuration
NEXT_PUBLIC_FARCASTER_APP_NAME=WellSpace
NEXT_PUBLIC_FARCASTER_APP_URL=https://wellspace.app/farcaster
NEXT_PUBLIC_FARCASTER_WEBHOOK_URL=https://wellspace.app/api/webhook

# App Configuration
NEXT_PUBLIC_URL=https://wellspace.app
NEXT_PUBLIC_APP_NAME=WellSpace
```

### 2. Deploy Your App

1. **Build and deploy** your Next.js app to your hosting platform
2. **Update DNS** to point `wellspace.app` to your deployed app
3. **Verify HTTPS** is working (required for Farcaster)

### 3. Update Farcaster Configuration

Your `.well-known/farcaster.json` is already configured, but verify these URLs match your deployment:

```json
{
  "frame": {
    "name": "WellSpace",
    "homeUrl": "https://wellspace.app",
    "webhookUrl": "https://wellspace.app/api/webhook"
  }
}
```

### 4. Test Your Frame

1. **Visit** `https://wellspace.app/farcaster` in your browser
2. **Test** all functionality (logging activities, meals, goals)
3. **Verify** the frame loads correctly

## 🎯 How to Use on Farcaster

### For Users:
1. **Find the frame** - Users can discover your frame through Farcaster
2. **Add to their feed** - Click "Add Frame" to integrate with Farcaster
3. **Track wellness** - Use the frame to log activities, meals, and goals
4. **Receive notifications** - Get updates about their wellness progress

### For Developers:
1. **Frame Discovery** - Users can find your frame via the Farcaster app
2. **Frame Actions** - Users can interact with your wellness tracking features
3. **Notifications** - Send wellness reminders and achievements to users
4. **Data Sync** - All wellness data is stored on-chain via your smart contracts

## 🔗 Smart Contract Integration

Your wellness data is automatically synced with your deployed smart contracts:

- **WellnessTracker.sol** - Stores activity and meal data
- **UserProfile.sol** - Manages user profiles and preferences
- **Rewards.sol** - Handles wellness achievements and rewards

## 📱 Frame Features

### Current Features:
- ✅ **Dashboard View** - Overview of wellness metrics
- ✅ **Activity Logging** - Track exercise and activities
- ✅ **Meal Logging** - Record daily meals
- ✅ **Goal Setting** - Set and track weekly wellness goals
- ✅ **Progress Tracking** - Monitor streaks and scores

### Planned Features:
- 🔄 **Social Sharing** - Share achievements on Farcaster
- 🔄 **Challenges** - Participate in community wellness challenges
- 🔄 **NFT Rewards** - Earn wellness NFTs for achievements
- 🔄 **Community** - Connect with other wellness enthusiasts

## 🚨 Important Notes

### Security:
- All frame interactions are verified through Farcaster's verification system
- User data is stored on-chain for transparency and ownership
- Notifications require explicit user consent

### Performance:
- Frame loads are optimized for mobile devices
- Smart contract calls are batched for efficiency
- Local state provides immediate UI feedback

### Compliance:
- Follows Farcaster's frame guidelines
- Respects user privacy and data ownership
- Compliant with Base network requirements

## 🐛 Troubleshooting

### Common Issues:

1. **Frame not loading**
   - Check HTTPS configuration
   - Verify `.well-known/farcaster.json` is accessible
   - Ensure all URLs are correct

2. **Webhook errors**
   - Verify webhook endpoint is accessible
   - Check environment variables
   - Monitor server logs for errors

3. **Smart contract integration**
   - Ensure contracts are deployed to Base Sepolia
   - Verify contract addresses in environment
   - Check wallet connection and network

## 🚀 Next Steps

1. **Deploy** your app to production
2. **Test** the frame thoroughly
3. **Submit** to Farcaster for discovery
4. **Monitor** usage and gather feedback
5. **Iterate** and add new features

## 📚 Resources

- [Farcaster Frame Documentation](https://docs.farcaster.xyz/developers/frames)
- [Farcaster MiniApp SDK Documentation](https://docs.farcaster.xyz/developers/miniapps)
- [Base Network Documentation](https://docs.base.org/)
- [OnchainKit Documentation](https://docs.onchainkit.com/)
- [WellSpace Smart Contracts](../contracts/)

## 🤝 Support

For questions or issues:
- Check the troubleshooting section above
- Review Farcaster's official documentation
- Open an issue in this repository

---

**Happy Building! 🎉**

Your WellSpace app is now ready to help Farcaster users track their wellness journey on-chain!
