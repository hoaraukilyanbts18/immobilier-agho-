/* =========================================================
   ARPENT — page Contact (contact.html)
   Dépend de : favs.js, common.js
   ========================================================= */
const FAQS = [
  {q:"Comment déposer une annonce ?", a:"Créez un compte, cliquez sur « Déposer une annonce » puis renseignez les caractéristiques du bien et vos photos. L'annonce est mise en ligne après validation."},
  {q:"Les annonces sont-elles vérifiées ?", a:"Oui, chaque annonce est contrôlée par notre équipe avant publication afin de limiter les doublons et les informations erronées."},
  {q:"Comment fonctionne la mise en favoris ?", a:"Cliquez sur le cœur d'une annonce pour la retrouver dans l'onglet « Favoris ». Vous pouvez aussi créer une alerte sur vos critères de recherche."},
  {q:"Puis-je annuler une demande de visite ?", a:"Oui, depuis votre espace personnel, section « Mes demandes de visite », vous pouvez annuler ou reprogrammer un rendez-vous."},
];

function renderFAQ(){
  document.getElementById('faqList').innerHTML = FAQS.map((f, i) => `
    <div class="faq-item" id="faq-${i}">
      <div class="faq-q" onclick="toggleFaq(${i})">${f.q} <span class="chevron">⌄</span></div>
      <div class="faq-a">${f.a}</div>
    </div>`).join('');
}
function toggleFaq(i){ document.getElementById('faq-' + i).classList.toggle('open'); }

function submitContact(e){
  e.preventDefault();
  showToast('Votre message a été envoyé.');
  e.target.reset();
}

document.addEventListener('DOMContentLoaded', renderFAQ);
