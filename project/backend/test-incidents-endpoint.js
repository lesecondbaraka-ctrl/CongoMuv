const axios = require('axios');

const SUPABASE_URL = 'https://bnyoyldctqbppvwqfodc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueW95bGRjdHFicHB2d3Fmb2RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDYzMTcxOSwiZXhwIjoyMDc2MjA3NzE5fQ.uLoD2YjcjVtV0sTvrTqrWTrRLl7mr6Pe3jfkAiAakGs';

async function testIncidentsEndpoint() {
  try {
    console.log('🧪 Test de l\'endpoint incidents...\n');
    
    // Test 1: Récupérer les incidents depuis Supabase directement
    console.log('📝 Test 1: Récupération depuis Supabase...');
    const { data: incidents } = await axios.get(
      `${SUPABASE_URL}/rest/v1/incidents?select=*&order=created_at.desc&limit=10`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );
    
    console.log(`✅ ${incidents.length} incidents trouvés dans Supabase`);
    console.log('\n📋 Premiers incidents:');
    incidents.slice(0, 3).forEach(inc => {
      console.log(`  - ${inc.type} (${inc.severity}) - ${inc.status}`);
    });
    
    // Test 2: Tester l'endpoint backend
    console.log('\n📝 Test 2: Test de l\'endpoint backend...');
    try {
      const backendResponse = await axios.get(
        'http://localhost:3002/api/admin-hq/incidents',
        {
          headers: {
            'Authorization': 'Bearer test-token'
          }
        }
      );
      console.log('✅ Backend répond:', backendResponse.status);
      console.log('📊 Données reçues:', backendResponse.data);
    } catch (backendError) {
      console.log('❌ Erreur backend:', backendError.response?.status, backendError.response?.data || backendError.message);
    }
    
    console.log('\n✅ Tests terminés !');
    
  } catch (error) {
    console.error('\n❌ Erreur lors des tests:', error.message);
    if (error.response) {
      console.error('Détails:', error.response.data);
    }
  }
}

testIncidentsEndpoint();
