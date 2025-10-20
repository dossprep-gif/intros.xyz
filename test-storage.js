// Test script to verify storage bucket setup
// Run this in your browser console on your app to test storage

async function testStorageSetup() {
  console.log('Testing storage setup...');
  
  try {
    // Import supabase client (adjust path as needed)
    const { supabase } = await import('./src/lib/supabase.ts');
    
    // Test 1: Check if bucket exists
    console.log('1. Checking if bucket exists...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return;
    }
    
    const profilePicturesBucket = buckets.find(bucket => bucket.id === 'profile-pictures');
    
    if (!profilePicturesBucket) {
      console.error('❌ profile-pictures bucket not found!');
      console.log('Available buckets:', buckets.map(b => b.id));
      return;
    }
    
    console.log('✅ profile-pictures bucket found:', profilePicturesBucket);
    
    // Test 2: Check bucket policies
    console.log('2. Checking bucket policies...');
    const { data: policies, error: policiesError } = await supabase.rpc('get_storage_policies');
    
    if (policiesError) {
      console.log('Note: Could not check policies directly, but bucket exists');
    } else {
      console.log('Storage policies:', policies);
    }
    
    // Test 3: Try to list files (should work even if empty)
    console.log('3. Testing bucket access...');
    const { data: files, error: filesError } = await supabase.storage
      .from('profile-pictures')
      .list();
    
    if (filesError) {
      console.error('❌ Error accessing bucket:', filesError);
      return;
    }
    
    console.log('✅ Bucket access successful. Files:', files);
    console.log('🎉 Storage setup is working correctly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testStorageSetup();
