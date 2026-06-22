// Supabase Configuration
const SUPABASE_URL = 'https://utbtmsnygrdbueeneufu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0YnRtc255Z3JkYnVlZW5ldWZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3OTk5MDksImV4cCI6MjA5NzM3NTkwOX0.j57v_ArhCtMg-WwD5KPePuXnI9M1i_Ch1KnxwVb7Fjk';

window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("Supabase đã được khởi tạo thành công!");

