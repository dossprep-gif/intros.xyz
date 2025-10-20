import { supabase } from './supabase'
import { validateUser, validateIntroduction } from '@/utils/security'

// User operations
export class SupabaseUserService {
  // Get current user
  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user:', error)
      return null
    }

    return {
      ...data,
      isAuthenticated: true
    }
  }

  // Create or update user profile
  static async upsertUser(userData: any) {
    if (!validateUser(userData)) {
      throw new Error('Invalid user data')
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: userData.email,
        name: userData.name,
        position: userData.position,
        location: userData.location,
        bio: userData.bio,
        education: userData.education,
        expertise: userData.expertise,
        hobbies: userData.hobbies,
        adjectives: userData.adjectives,
        social_links: userData.socialLinks,
        profile_picture_url: userData.profilePictureUrl,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error upserting user:', error)
      throw error
    }

    return {
      ...data,
      isAuthenticated: true
    }
  }

  // Sign up new user
  static async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    })

    if (error) throw error
    return data
  }

  // Sign in user
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  }

  // Sign out user
  static async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // Get auth session
  static async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }
}

// Introduction operations
export class SupabaseIntroductionService {
  // Get all introductions for current user
  static async getIntroductions() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('introductions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching introductions:', error)
      return []
    }

    // Transform data to match existing format
    return data.map(intro => ({
      id: intro.id,
      personA: {
        name: intro.person_a_name,
        email: intro.person_a_email,
        phone: intro.person_a_phone
      },
      personB: {
        name: intro.person_b_name,
        email: intro.person_b_email,
        phone: intro.person_b_phone
      },
      date: intro.date,
      notes: intro.notes,
      verified: intro.verified
    }))
  }

  // Add new introduction
  static async addIntroduction(introductionData: any) {
    if (!validateIntroduction(introductionData)) {
      throw new Error('Invalid introduction data')
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('introductions')
      .insert({
        user_id: user.id,
        person_a_name: introductionData.personA.name,
        person_a_email: introductionData.personA.email,
        person_a_phone: introductionData.personA.phone,
        person_b_name: introductionData.personB.name,
        person_b_email: introductionData.personB.email,
        person_b_phone: introductionData.personB.phone,
        notes: introductionData.notes,
        date: introductionData.date,
        verified: introductionData.verified || false
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding introduction:', error)
      throw error
    }

    // Transform response to match existing format
    return {
      id: data.id,
      personA: {
        name: data.person_a_name,
        email: data.person_a_email,
        phone: data.person_a_phone
      },
      personB: {
        name: data.person_b_name,
        email: data.person_b_email,
        phone: data.person_b_phone
      },
      date: data.date,
      notes: data.notes,
      verified: data.verified
    }
  }

  // Update introduction
  static async updateIntroduction(id: string, updates: any) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('introductions')
      .update({
        person_a_name: updates.personA?.name,
        person_a_email: updates.personA?.email,
        person_a_phone: updates.personA?.phone,
        person_b_name: updates.personB?.name,
        person_b_email: updates.personB?.email,
        person_b_phone: updates.personB?.phone,
        notes: updates.notes,
        date: updates.date,
        verified: updates.verified,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating introduction:', error)
      throw error
    }

    return {
      id: data.id,
      personA: {
        name: data.person_a_name,
        email: data.person_a_email,
        phone: data.person_a_phone
      },
      personB: {
        name: data.person_b_name,
        email: data.person_b_email,
        phone: data.person_b_phone
      },
      date: data.date,
      notes: data.notes,
      verified: data.verified
    }
  }

  // Delete introduction
  static async deleteIntroduction(id: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('introductions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting introduction:', error)
      throw error
    }

    return true
  }
}

// Friends operations
export class SupabaseFriendsService {
  // Get all friends for current user
  static async getFriends() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('friends')
      .select(`
        *,
        friend:friend_id (
          id,
          name,
          email,
          position,
          location,
          profile_picture_url,
          expertise,
          hobbies
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching friends:', error)
      return []
    }

    return data.map(friendship => friendship.friend)
  }

  // Get pending friend requests (sent by current user)
  static async getPendingRequests() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('friends')
      .select(`
        *,
        friend:friend_id (
          id,
          name,
          email,
          position,
          location,
          profile_picture_url
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pending requests:', error)
      return []
    }

    return data.map(friendship => friendship.friend)
  }

  // Get incoming friend requests (received by current user)
  static async getIncomingRequests() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('friends')
      .select(`
        *,
        user:user_id (
          id,
          name,
          email,
          position,
          location,
          profile_picture_url
        )
      `)
      .eq('friend_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching incoming requests:', error)
      return []
    }

    return data.map(friendship => friendship.user)
  }

  // Send friend request
  static async sendFriendRequest(friendId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Check if friendship already exists
    const { data: existing } = await supabase
      .from('friends')
      .select('*')
      .eq('user_id', user.id)
      .eq('friend_id', friendId)
      .single()

    if (existing) {
      throw new Error('Friend request already exists')
    }

    const { data, error } = await supabase
      .from('friends')
      .insert({
        user_id: user.id,
        friend_id: friendId,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error sending friend request:', error)
      throw error
    }

    return data
  }

  // Accept friend request
  static async acceptFriendRequest(friendId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Update the incoming request to accepted
    const { data, error } = await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('user_id', friendId)
      .eq('friend_id', user.id)
      .eq('status', 'pending')
      .select()
      .single()

    if (error) {
      console.error('Error accepting friend request:', error)
      throw error
    }

    // Create reciprocal friendship
    const { error: reciprocalError } = await supabase
      .from('friends')
      .insert({
        user_id: user.id,
        friend_id: friendId,
        status: 'accepted'
      })

    if (reciprocalError) {
      console.error('Error creating reciprocal friendship:', reciprocalError)
      // Don't throw here as the main friendship was created
    }

    return data
  }

  // Reject friend request
  static async rejectFriendRequest(friendId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('user_id', friendId)
      .eq('friend_id', user.id)
      .eq('status', 'pending')

    if (error) {
      console.error('Error rejecting friend request:', error)
      throw error
    }

    return true
  }

  // Remove friend
  static async removeFriend(friendId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Remove both directions of the friendship
    const { error } = await supabase
      .from('friends')
      .delete()
      .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)

    if (error) {
      console.error('Error removing friend:', error)
      throw error
    }

    return true
  }

  // Search users by name or email
  static async searchUsers(query: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, position, location, profile_picture_url, expertise, hobbies')
      .neq('id', user.id) // Exclude current user
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(20)

    if (error) {
      console.error('Error searching users:', error)
      return []
    }

    return data
  }

  // Get user by ID
  static async getUserById(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, position, location, bio, education, expertise, hobbies, adjectives, social_links, profile_picture_url, created_at')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user:', error)
      return null
    }

    return data
  }

  // Check friendship status with another user
  static async getFriendshipStatus(friendId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('friends')
      .select('*')
      .eq('user_id', user.id)
      .eq('friend_id', friendId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking friendship status:', error)
      return null
    }

    return data
  }
}

// Migration helper to move localStorage data to Supabase
export class MigrationService {
  static async migrateLocalStorageToSupabase() {
    const userData = localStorage.getItem('user')
    const introductionsData = localStorage.getItem('introductions')

    if (userData) {
      try {
        const user = JSON.parse(userData)
        await SupabaseUserService.upsertUser(user)
        console.log('User data migrated successfully')
      } catch (error) {
        console.error('Error migrating user data:', error)
      }
    }

    if (introductionsData) {
      try {
        const introductions = JSON.parse(introductionsData)
        for (const intro of introductions) {
          await SupabaseIntroductionService.addIntroduction(intro)
        }
        console.log('Introductions data migrated successfully')
      } catch (error) {
        console.error('Error migrating introductions data:', error)
      }
    }
  }
}
