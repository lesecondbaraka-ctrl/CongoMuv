const axios = require('axios');

async function testEndpoint() {
  try {
    console.log('🧪 Test de l\'endpoint sans auth...\n');
    
    const response = await axios.get('http://localhost:3002/api/admin-hq/incidents/test');
    
    console.log('✅ Status:', response.status);
    console.log('📊 Nombre d\'incidents:', response.data.count);
    console.log('\n📋 Incidents:');
    response.data.data.slice(0, 5).forEach(inc => {
      console.log(`  - [${inc.severity}] ${inc.type} (${inc.status}) - ${inc.location || 'N/A'}`);
    });
    
    console.log('\n✅ L\'endpoint fonctionne ! Les incidents sont bien dans la base.');
    console.log('\n⚠️  Le problème est l\'authentification. Vérifiez que vous êtes connecté dans le dashboard.');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.response) {
      console.error('Détails:', error.response.data);
    }
  }
}

testEndpoint();
