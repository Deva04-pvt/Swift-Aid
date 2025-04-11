import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import cloudinary from '@/lib/cloudinary';
import WoundHistory from '@/models/WoundHistory';
import { getServerSession } from 'next-auth';
import User from '@/models/UserCredentials';

export async function POST(req) {
  try {
    const session = await getServerSession();
    console.log('Session data:', session);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database first
    await connectToDatabase();
    
    // Find user to get their MongoDB ObjectId
    const user = await User.findOne({ email: session.user.email });
    console.log('Found user:', user?._id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { image, prediction, confidence } = await req.json();
    console.log('Received prediction data:', { prediction, confidence });

    // Upload to Cloudinary
    let uploadResponse;
    try {
      uploadResponse = await cloudinary.uploader.upload(image, {
        folder: 'wound-images',
        resource_type: 'auto',
        transformation: [
          { width: 800, height: 800, crop: 'limit' }
        ]
      });
      console.log('Cloudinary upload successful');

    } catch (cloudinaryError) {
      console.error('Cloudinary error:', cloudinaryError);
      return NextResponse.json({ 
        error: 'Failed to upload image',
        details: cloudinaryError.message 
      }, { status: 500 });
    }

    // Save to MongoDB
    try {
      console.log('Attempting to save to MongoDB...');
      const woundHistory = await WoundHistory.create({
        userId: user._id,
        imageUrl: uploadResponse.secure_url,
        publicUrl: uploadResponse.url,
        cloudinaryPublicId: uploadResponse.public_id,
        prediction,
        confidence: parseFloat(confidence),
        width: uploadResponse.width,
        height: uploadResponse.height,
        format: uploadResponse.format,
        createdAt: new Date()
      });
      console.log('MongoDB save successful');

      // Populate user data
      await woundHistory.populate('userId', 'firstName lastName email');

      return NextResponse.json({
        success: true,
        data: woundHistory
      });

    } catch (dbError) {
      console.error('MongoDB error:', dbError);
      // Cleanup Cloudinary upload if MongoDB fails
      try {
        await cloudinary.uploader.destroy(uploadResponse.public_id);
      } catch (cleanupError) {
        console.error('Failed to cleanup Cloudinary:', cleanupError);
      }

      return NextResponse.json({ 
        error: 'Database save failed',
        details: dbError.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error('General error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find history and populate user details
    const history = await WoundHistory.find({ userId: user._id })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: history
    });

  } catch (error) {
    console.error('Error fetching wound history:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}