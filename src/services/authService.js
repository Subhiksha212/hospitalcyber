// backend/src/services/authService.js
const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');

class AuthService {
    // Sign up new user
    async signUp(email, password, userData) {
        try {
            // Create user in Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: userData.name,
                        role: userData.role || 'patient'
                    }
                }
            });

            if (authError) throw authError;

            // Create user profile in users table
            if (authData.user) {
                const { error: profileError } = await supabase
                    .from('users')
                    .insert([{
                        id: authData.user.id,
                        email: email,
                        name: userData.name,
                        role: userData.role || 'patient',
                        is_verified: false,
                        created_at: new Date().toISOString()
                    }]);

                if (profileError) throw profileError;
            }

            return {
                success: true,
                user: authData.user,
                session: authData.session
            };
        } catch (error) {
            console.error('Sign up error:', error);
            throw error;
        }
    }

    // Sign in user
    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // Get additional user data from users table
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', data.user.id)
                .single();

            if (userError) {
                console.log('User profile not found, creating...');
                // Create profile if it doesn't exist
                const { data: newUser, error: createError } = await supabase
                    .from('users')
                    .insert([{
                        id: data.user.id,
                        email: email,
                        name: email.split('@')[0],
                        role: 'patient',
                        is_verified: true,
                        created_at: new Date().toISOString()
                    }])
                    .select()
                    .single();

                if (createError) throw createError;
                
                return {
                    success: true,
                    session: data.session,
                    user: {
                        ...data.user,
                        ...newUser
                    }
                };
            }

            return {
                success: true,
                session: data.session,
                user: {
                    ...data.user,
                    ...userData
                }
            };
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    }

    // Sign out user
    async signOut(accessToken) {
        try {
            const { error } = await supabase.auth.admin.signOut(accessToken);
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    }

    // Get user by ID
    async getUserById(userId) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Get user error:', error);
            throw error;
        }
    }

    // Get user by email
    async getUserByEmail(email) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } catch (error) {
            console.error('Get user by email error:', error);
            throw error;
        }
    }

    // Update user profile
    async updateUser(userId, updates) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Update user error:', error);
            throw error;
        }
    }

    // Verify email with token
    async verifyEmail(token) {
        try {
            const { error } = await supabase.auth.verifyOtp({
                token_hash: token,
                type: 'email'
            });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Verify email error:', error);
            throw error;
        }
    }

    // Reset password
    async resetPassword(email) {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${process.env.CLIENT_URL}/reset-password`
            });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    }

    // Update password
    async updatePassword(newPassword, accessToken) {
        try {
            const { error } = await supabase.auth.admin.updateUserById(
                accessToken,
                { password: newPassword }
            );

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Update password error:', error);
            throw error;
        }
    }
}

module.exports = new AuthService();