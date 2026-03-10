// backend/src/services/supabase.mock.js
// Mock Supabase client for testing when credentials are not available

const mockData = {
  users: [
    {
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'patient',
      is_verified: true
    }
  ],
  doctors: [
    { id: '1', name: 'Dr. Sarah Chen', specialty: 'Cardiology', color: 'emerald', image_code: 'SC' },
    { id: '2', name: 'Dr. Michael Rodriguez', specialty: 'Internal Medicine', color: 'blue', image_code: 'MR' },
    { id: '3', name: 'Dr. Emily Watson', specialty: 'Dermatology', color: 'purple', image_code: 'EW' },
    { id: '4', name: 'Dr. James Kim', specialty: 'Family Medicine', color: 'amber', image_code: 'JK' }
  ],
  appointments: []
};

const mockSupabase = {
  from: (table) => ({
    select: (columns) => ({
      data: mockData[table] || [],
      error: null,
      single: () => ({ data: mockData[table]?.[0] || null, error: null }),
      eq: (field, value) => ({
        data: mockData[table]?.filter(item => item[field] === value) || [],
        error: null,
        single: () => ({ 
          data: mockData[table]?.find(item => item[field] === value) || null, 
          error: null 
        }),
        order: () => ({ data: mockData[table] || [], error: null })
      }),
      order: () => ({ data: mockData[table] || [], error: null })
    }),
    insert: (data) => ({
      data: data[0],
      error: null,
      select: () => ({
        single: () => ({ data: data[0], error: null })
      })
    }),
    update: (data) => ({
      data: data,
      error: null,
      eq: () => ({
        data: data,
        error: null,
        single: () => ({ data: data, error: null })
      })
    })
  }),
  auth: {
    signUp: async ({ email, password }) => ({
      data: { user: { id: '123', email } },
      error: null
    }),
    signInWithPassword: async ({ email, password }) => ({
      data: { user: { id: '123', email } },
      error: null
    })
  }
};

module.exports = mockSupabase;