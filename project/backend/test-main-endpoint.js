const axios = require('axios');

async function testMainEndpoint() {
  try {
    console.log('🧪 Test de l\'endpoint principal /api/admin-hq/incidents...\n');
    
    const response = await axios.get('http://localhost:3002/api/admin-hq/incidents');
    
    console.log('✅ Status:', response.status);
    console.log('📊 Données:', response.data);
    console.log('📋 Nombre d\'incidents:', response.data.data?.length || 0);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('\n✅ SUCCÈS ! Les incidents s\'affichent maintenant sans authentification.');
      console.log('\n📋 Premiers incidents:');
      response.data.data.slice(0, 3).forEach(inc => {
        console.log(`  - [${inc.severity}] ${inc.type} - ${inc.location || 'N/A'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Détails:', error.response.data);
    }
  }
}

testMainEndpoint();
