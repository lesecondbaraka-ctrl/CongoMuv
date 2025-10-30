const axios = require('axios');

const SUPABASE_URL = 'https://bnyoyldctqbppvwqfodc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueW95bGRjdHFicHB2d3Fmb2RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDYzMTcxOSwiZXhwIjoyMDc2MjA3NzE5fQ.uLoD2YjcjVtV0sTvrTqrWTrRLl7mr6Pe3jfkAiAakGs';

async function createTestIncidents() {
  try {
    console.log('🔧 Création d\'incidents de test...\n');
    
    // 1. Récupérer un user_id existant
    console.log('📝 Récupération d\'un utilisateur...');
    const { data: users } = await axios.get(
      `${SUPABASE_URL}/rest/v1/admin_users?select=id&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );
    
    let userId = null;
    if (users && users.length > 0) {
      userId = users[0].id;
      console.log(`✅ Utilisateur trouvé : ${userId}`);
    } else {
      console.log('⚠️  Aucun utilisateur trouvé, utilisation d\'un UUID système...');
      // Utiliser un UUID système générique
      userId = '00000000-0000-0000-0000-000000000000';
      console.log(`✅ UUID système : ${userId}`);
    }
    
    // 2. Créer des incidents de test avec le user_id
    console.log('\n📝 Création d\'incidents de test...');
    const testIncidents = [
      {
        user_id: userId,
        subject: 'Retard de bus',
        message: 'Le bus sur la ligne Kinshasa-Matadi a 2h de retard',
        priority: 'high',
        status: 'open' // Valeurs possibles: open, in_progress, resolved, closed
      },
      {
        user_id: userId,
        subject: 'Panne mécanique',
        message: 'Véhicule en panne sur la route nationale',
        priority: 'high', // Valeurs possibles: low, medium, high (pas critical)
        status: 'open'
      },
      {
        user_id: userId,
        subject: 'Plainte passager',
        message: 'Passager mécontent du service',
        priority: 'low',
        status: 'open'
      },
      {
        user_id: userId,
        subject: 'Embouteillage',
        message: 'Trafic dense sur l\'avenue Lumumba',
        priority: 'medium',
        status: 'in_progress'
      },
      {
        user_id: userId,
        subject: 'Accident mineur',
        message: 'Accrochage sans blessés à Gombe',
        priority: 'high',
        status: 'resolved'
      }
    ];
    
    let successCount = 0;
    for (const incident of testIncidents) {
      try {
        await axios.post(
          `${SUPABASE_URL}/rest/v1/support_tickets`,
          incident,
          {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            }
          }
        );
        console.log(`✅ Incident créé : ${incident.subject}`);
        successCount++;
      } catch (err) {
        console.log(`❌ Erreur pour "${incident.subject}":`, err.response?.data?.message || err.message);
      }
    }
    
    // 3. Vérifier les incidents créés
    console.log('\n📊 Vérification des incidents...');
    const { data: incidents } = await axios.get(
      `${SUPABASE_URL}/rest/v1/support_tickets?select=*&order=created_at.desc&limit=10`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );
    
    console.log(`\n📝 Nombre total d'incidents : ${incidents.length}`);
    console.log(`✅ Incidents créés avec succès : ${successCount}`);
    console.log('\n📋 Incidents récents :');
    incidents.slice(0, 5).forEach(inc => {
      console.log(`  - [${inc.priority?.toUpperCase() || 'N/A'}] ${inc.subject} (${inc.status})`);
    });
    
    console.log('\n✅ Configuration terminée avec succès !');
    console.log('\n💡 Vous pouvez maintenant voir les incidents dans le dashboard admin.');
    console.log('🔗 Accédez à : http://localhost:5174/#/admin');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la configuration :', error.message);
    if (error.response) {
      console.error('Détails:', error.response.data);
    }
  }
}

createTestIncidents();
