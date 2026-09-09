/* =========================================================
   ARPENT — Authentification (Supabase Auth)
   Dépend de : supabase-client.js, common.js (pour showToast)
   ========================================================= */

async function signUp(email, password, fullName){
  const { data, error } = await supabaseClient.auth.signUp({
    email, password, options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return data;
}

async function signIn(email, password){
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function signOut(){
  await supabaseClient.auth.signOut();
}

async function requestPasswordReset(email){
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/reinitialiser-mot-de-passe.html',
  });
  if (error) throw error;
}

async function getCurrentUser(){
  const { data: { user } } = await supabaseClient.auth.getUser();
  return user;
}

async function getCurrentProfile(){
  const user = await getCurrentUser();
  if (!user) return null;
  const { data } = await supabaseClient.from('profiles').select('*').eq('id', user.id).single();
  return data;
}

/* ---- Branchement sur la modale existante (voir common.js / le HTML des pages) ---- */
async function submitAuth(e){
  e.preventDefault();
  const form = e.target;
  const email = form.querySelector('input[type=email]').value.trim();
  const password = form.querySelector('input[type=password]').value;
  const fullNameInput = form.querySelector('#nameField input');

  try {
    if (authTab === 'login'){
      await signIn(email, password);
      closeAuth();
      showToast('Connexion réussie.');
    } else {
      await signUp(email, password, fullNameInput ? fullNameInput.value.trim() : '');
      closeAuth();
      showToast('Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse.');
    }
    document.dispatchEvent(new CustomEvent('arpent:auth-changed'));
  } catch (err){
    showToast(err.message || 'Une erreur est survenue.');
  }
}

function requestResetFromModal(){
  const email = document.querySelector('#authOverlay input[type=email]').value.trim();
  if (!email){ showToast('Renseignez votre e-mail ci-dessus d’abord.'); return; }
  requestPasswordReset(email)
    .then(() => showToast('E-mail de réinitialisation envoyé.'))
    .catch(err => showToast(err.message || 'Erreur lors de l’envoi.'));
}
