module.exports = {
  apps: [
    {
      name: 'dev-stock-backend',    // Nom de l'application
      script: './index.js',         // Chemin vers votre fichier principal
      instances: 1,             // Utiliser tous les cœurs du CPU disponibles
      exec_mode: 'fork',         // Mode cluster pour améliorer la performance
      watch: true,                  // Recharger automatiquement en cas de modifications des fichiers
      env: {
        NODE_ENV: 'development',    // Environnement de développement
      },
      env_production: {
        NODE_ENV: 'production',     // Environnement production
      },
    },
  ],
};
