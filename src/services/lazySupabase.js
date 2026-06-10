let supabaseAppModulePromise;
let supabaseClientModulePromise;
let supabaseTarotModulePromise;

export function loadSupabaseAppModule() {
  if (!supabaseAppModulePromise) {
    supabaseAppModulePromise = import('../supabaseApp');
  }

  return supabaseAppModulePromise;
}

export function loadSupabaseClientModule() {
  if (!supabaseClientModulePromise) {
    supabaseClientModulePromise = import('../supabaseClient');
  }

  return supabaseClientModulePromise;
}

export function loadSupabaseTarotModule() {
  if (!supabaseTarotModulePromise) {
    supabaseTarotModulePromise = import('../supabaseTarot');
  }

  return supabaseTarotModulePromise;
}
