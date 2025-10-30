const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration de la base de données
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/congomuv',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function setupIncidents() {
  try {
    console.log('🔧 Configuration de la table support_tickets...\n');
    
    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, 'create_support_tickets.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Exécuter le SQL
    await pool.query(sql);
    
    console.log('✅ Table support_tickets créée avec succès !');
    console.log('✅ Incidents de test insérés !');
    console.log('\n📊 Vérification des données...\n');
    
    // Vérifier les données
    const result = await pool.query('SELECT COUNT(*) as count FROM support_tickets');
    console.log(`📝 Nombre d'incidents dans la base : ${result.rows[0].count}`);
    
    // Afficher quelques incidents
    const incidents = await pool.query('SELECT id, subject, priority, status FROM support_tickets LIMIT 5');
    console.log('\n📋 Incidents récents :');
    incidents.rows.forEach(inc => {
      console.log(`  - [${inc.priority.toUpperCase()}] ${inc.subject} (${inc.status})`);
    });
    
    console.log('\n✅ Configuration terminée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la configuration :', error.message);
    console.error(error);
    process.exit(1);
  }
}

setupIncidents();
