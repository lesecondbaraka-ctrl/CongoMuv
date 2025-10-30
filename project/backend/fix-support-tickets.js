const axios = require('axios');

const SUPABASE_URL = 'https://bnyoyldctqbppvwqfodc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueW95bGRjdHFicHB2d3Fmb2RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDYzMTcxOSwiZXhwIjoyMDc2MjA3NzE5fQ.uLoD2YjcjVtV0sTvrTqrWTrRLl7mr6Pe3jfkAiAakGs';

async function fixSupportTickets() {
  try {
    console.log('🔧 Configuration de la table support_tickets via Supabase...\n');
    
    // 1. Modifier la contrainte NOT NULL sur user_id via SQL
    console.log('📝 Modification de la contrainte user_id...');
    const sqlQuery = `ALTER TABLE support_tickets ALTER COLUMN user_id DROP NOT NULL;`;
    
    try {
      await axios.post(
        `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
        { query: sqlQuery },
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Contrainte modifiée avec succès !');
    } catch (err) {
      console.log('⚠️  La contrainte a peut-être déjà été modifiée ou la fonction n\'existe pas');
    }
    
    // 2. Insérer des incidents de test
    console.log('\n📝 Insertion d\'incidents de test...');
    const testIncidents = [
      {
        subject: 'Retard de bus',
        message: 'Le bus sur la ligne Kinshasa-Matadi a 2h de retard',
        priority: 'high',
        status: 'investigating'
      },
      {
        subject: 'Panne mécanique',
        message: 'Véhicule en panne sur la route nationale',
        priority: 'critical',
        status: 'investigating'
      },
      {
        subject: 'Plainte passager',
        message: 'Passager mécontent du service',
        priority: 'low',
        status: 'open'
      }
    ];
    
    for (const incident of testIncidents) {
      try {
        const { data } = await axios.post(
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
      } catch (err) {
        if (err.response?.status === 409) {
          console.log(`⚠️  Incident déjà existant : ${incident.subject}`);
        } else {
          console.log(`❌ Erreur pour "${incident.subject}":`, err.response?.data || err.message);
        }
      }
    }
    
    // 3. Vérifier les incidents
    console.log('\n📊 Vérification des incidents...');
    const { data: incidents } = await axios.get(
      `${SUPABASE_URL}/rest/v1/support_tickets?select=*&limit=10`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );
    
    console.log(`\n📝 Nombre total d'incidents : ${incidents.length}`);
    console.log('\n📋 Incidents récents :');
    incidents.slice(0, 5).forEach(inc => {
      console.log(`  - [${inc.priority?.toUpperCase() || 'N/A'}] ${inc.subject} (${inc.status})`);
    });
    
    console.log('\n✅ Configuration terminée avec succès !');
    console.log('\n💡 Vous pouvez maintenant utiliser le dashboard admin pour voir les incidents.');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la configuration :', error.message);
    if (error.response) {
      console.error('Détails:', error.response.data);
    }
  }
}

fixSupportTickets();
