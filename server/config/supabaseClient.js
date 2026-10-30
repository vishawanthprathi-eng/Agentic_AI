import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

export const isLiveSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-supabase-project')
);

let supabase = null;
if (isLiveSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Connected to live Supabase PostgreSQL database.');
  } catch (error) {
    console.warn('⚠️ Failed to initialize Supabase client:', error.message);
  }
} else {
  console.log('⚡ Running in In-Memory Database Fallback mode (Set SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY in .env for live Supabase)');
}

// In-Memory fallback store for seamless offline/preview operation
const memoryDb = {
  users: [],
  code_uploads: [],
  activity_logs: []
};

// Database interface abstraction supporting both Supabase and In-Memory fallback
export const db = {
  users: {
    async findByEmail(email) {
      if (isLiveSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email.toLowerCase())
          .maybeSingle();
        if (error) throw error;
        return data;
      }
      return memoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    },

    async findById(id) {
      if (isLiveSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('users')
          .select('id, email, role, created_at')
          .eq('id', id)
          .maybeSingle();
        if (error) throw error;
        return data;
      }
      const user = memoryDb.users.find(u => u.id === id);
      if (!user) return null;
      const { password_hash, ...safeUser } = user;
      return safeUser;
    },

    async create({ email, password_hash, role = 'member' }) {
      const id = crypto.randomUUID();
      const created_at = new Date().toISOString();
      const record = { id, email: email.toLowerCase(), password_hash, role, created_at };

      if (isLiveSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('users')
          .insert([record])
          .select('id, email, role, created_at')
          .single();
        if (error) throw error;
        return data;
      }

      memoryDb.users.push(record);
      return { id, email: record.email, role, created_at };
    },

    async getAll() {
      if (isLiveSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('users')
          .select('id, email, role, created_at')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
      }
      return memoryDb.users.map(({ password_hash, ...u }) => u);
    },

    async updateRole(id, role) {
      if (isLiveSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('users')
          .update({ role })
          .eq('id', id)
          .select('id, email, role, created_at')
          .single();
        if (error) throw error;
        return data;
      }
      const user = memoryDb.users.find(u => u.id === id);
      if (!user) throw new Error('User not found');
      user.role = role;
      const { password_hash, ...safe } = user;
      return safe;
    }
  },

  codeUploads: {
    async create({ user_id, file_name, code_content, ai_status = 'pending', ai_feedback = '' }) {
      const id = crypto.randomUUID();
      const created_at = new Date().toISOString();
      const record = { id, user_id, file_name, code_content, ai_status, ai_feedback, created_at };

      if (isLiveSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('code_uploads')
          .insert([record])
          .select('*')
          .single();
        if (error) throw error;
        return data;
      }

      memoryDb.code_uploads.unshift(record);
      return record;
    },

    async updateStatusAndFeedback(id, { ai_status, ai_feedback }) {
      if (isLiveSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('code_uploads')
          .update({ ai_status, ai_feedback })
          .eq('id', id)
          .select('*')
          .single();
        if (error) throw error;
        return data;
      }

      const item = memoryDb.code_uploads.find(c => c.id === id);
      if (!item) throw new Error('Code upload record not found');
      item.ai_status = ai_status;
      item.ai_feedback = ai_feedback;
      return item;
    },

    async getByUserId(user_id) {
      if (isLiveSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('code_uploads')
          .select('*')
          .eq('user_id', user_id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
      }
      return memoryDb.code_uploads.filter(c => c.user_id === user_id);
    },

    async getById(id) {
      if (isLiveSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('code_uploads')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (error) throw error;
        return data;
      }
      return memoryDb.code_uploads.find(c => c.id === id) || null;
    },

    async getAll() {
      if (isLiveSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('code_uploads')
          .select(`
            *,
            users:user_id (id, email, role)
          `)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
      }
      return memoryDb.code_uploads.map(code => {
        const u = memoryDb.users.find(user => user.id === code.user_id);
        return {
          ...code,
          users: u ? { id: u.id, email: u.email, role: u.role } : null
        };
      });
    }
  },

  activityLogs: {
    async log({ user_id, action_description }) {
      const id = crypto.randomUUID();
      const created_at = new Date().toISOString();
      const record = { id, user_id, action_description, created_at };

      if (isLiveSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('activity_logs')
            .insert([record])
            .select('*')
            .single();
          if (error) console.error('Error writing activity log to Supabase:', error.message);
          return data;
        } catch (err) {
          console.error('Exception writing activity log:', err.message);
        }
      }

      memoryDb.activity_logs.unshift(record);
      return record;
    },

    async getAll(limit = 100) {
      if (isLiveSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('activity_logs')
          .select(`
            *,
            users:user_id (id, email, role)
          `)
          .order('created_at', { ascending: false })
          .limit(limit);
        if (error) throw error;
        return data;
      }

      return memoryDb.activity_logs.slice(0, limit).map(log => {
        const u = memoryDb.users.find(user => user.id === log.user_id);
        return {
          ...log,
          users: u ? { id: u.id, email: u.email, role: u.role } : null
        };
      });
    }
  }
};

export default supabase;
