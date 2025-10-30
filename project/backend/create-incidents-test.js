const axios = require('axios');

const SUPABASE_URL = 'https://bnyoyldctqbppvwqfodc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueW95bGRjdHFicHB2d3Fmb2RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDYzMTcxOSwiZXhwIjoyMDc2MjA3NzE5fQ.uLoD2YjcjVtV0sTvrTqrWTrRLl7mr6Pe3jfkAiAakGs';

async function createIncidentsTest() {
  try {
    console.log('🔧 Création d\'incidents de test dans la table incidents...\n');
    
    // Créer des incidents de test
    const testIncidents = [
      {
        type: 'Retard de bus',
        description: 'Le bus sur la ligne Kinshasa-Matadi a 2h de retard',
        severity: 'high',
        status: 'open',
        location: 'Kinshasa-Matadi'
      },
      {
        type: 'Panne mécanique',
        description: 'Véhicule en panne sur la route nationale',
        severity: 'high',
        status: 'open',
        location: 'Route Nationale N1'
      },
      {
        type: 'Plainte passager',
        description: 'Passager mécontent du service',
        severity: 'low',
        status: 'open',
        location: 'Gare centrale'
      },
      {
        type: 'Embouteillage',
        description: 'Trafic dense sur l\'avenue Lumumba',
        severity: 'medium',
        status: 'in_progress',
        location: 'Avenue Lumumba'
      },
      {
        type: 'Accident mineur',
        description: 'Accrochage sans blessés à Gombe',
        severity: 'high',
        status: 'resolved',
        location: 'Gombe'
      },
      {
        type: 'Problème de climatisation',
        description: 'Climatisation défectueuse dans le bus',
        severity: 'low',
        status: 'open',
        location: 'Bus ligne 5'
      },
      {
        type: 'Surcharge de passagers',
        description: 'Trop de passagers dans le véhicule',
        severity: 'medium',
        status: 'open',
        location: 'Ligne Kinshasa-Lubumbashi'
      }
    ];
    
    let successCount = 0;
    console.log('📝 Création des incidents...\n');
    
    for (const incident of testIncidents) {
      try {
        const { data } = await axios.post(
          `${SUPABASE_URL}/rest/v1/incidents`,
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
        console.log(`✅ Incident créé : ${incident.type} (${incident.severity})`);
        successCount++;
      } catch (err) {
        console.log(`❌ Erreur pour "${incident.type}":`, err.response?.data?.message || err.message);
      }
    }
    
    // Vérifier les incidents créés
    console.log('\n📊 Vérification des incidents...');
    const { data: incidents } = await axios.get(
      `${SUPABASE_URL}/rest/v1/incidents?select=*&order=created_at.desc&limit=20`,
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
    incidents.slice(0, 7).forEach(inc => {
      console.log(`  - [${inc.severity?.toUpperCase() || 'N/A'}] ${inc.type} (${inc.status}) - ${inc.location || 'N/A'}`);
    });
    
    console.log('\n✅ Configuration terminée avec succès !');
    console.log('\n💡 Vous pouvez maintenant voir les incidents dans le dashboard admin.');
    console.log('🔗 Accédez à : http://localhost:5174/#/admin');
    console.log('📍 Allez dans l\'onglet "Incidents"');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la configuration :', error.message);
    if (error.response) {
      console.error('Détails:', error.response.data);
    }
  }
}

createIncidentsTest();
