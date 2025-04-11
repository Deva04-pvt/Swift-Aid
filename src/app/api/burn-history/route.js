import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import cloudinary from '@/lib/cloudinary';
import BurnHistory from '@/models/BurnHistory';
import { getServerSession } from 'next-auth';
import User from '@/models/UserCredentials';

export async function POST(req) {
  try {
    const session = await getServerSession();
    console.log('Session data:', session);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    // Find user to get their MongoDB ObjectId
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { image, prediction, confidence } = await req.json();

    // Upload to Cloudinary
    let uploadResponse;
    try {
      uploadResponse = await cloudinary.uploader.upload(image, {
        folder: 'burn-images',
        resource_type: 'auto',
        // Add transformation if needed
        transformation: [
          { width: 800, height: 800, crop: 'limit' }
        ]
      });
      console.log('Cloudinary upload response:', uploadResponse);

    } catch (cloudinaryError) {
      console.error('Cloudinary upload error:', cloudinaryError);
      return NextResponse.json({ 
        error: 'Failed to upload image',
        details: cloudinaryError.message 
      }, { status: 500 });
    }

    // Save to MongoDB with proper ObjectId reference
    const burnHistory = await BurnHistory.create({
      userId: user._id, // This will be a proper MongoDB ObjectId reference
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

    // Populate the user data when returning the response
    await burnHistory.populate('userId', 'firstName lastName email');

    return NextResponse.json({
      success: true,
      data: burnHistory
    });

  } catch (error) {
    console.error('Error in burn-history API:', error);
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
    const history = await BurnHistory.find({ userId: user._id })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: history
    });

  } catch (error) {
    console.error('Error fetching burn history:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}