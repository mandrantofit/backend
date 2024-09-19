pipeline {
    agent any

    environment {
        SSH_PRIVATE_KEY = credentials('ssh-private-key-id') // Remplacez par l'ID du secret Jenkins contenant la clé SSH
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Set up Node.js') {
            tools {
                nodejs 'node-20.17.0' // Assurez-vous que cette version est configurée dans Jenkins
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Install netcat') {
            steps {
                sh 'sudo apt-get update && sudo apt-get install -y netcat'
            }
        }

        stage('Test Server Connectivity') {
            steps {
                sh 'nc -zv 172.25.52.205 22'
            }
        }

        stage('Deploy to Server') {
            steps {
                // Utiliser SSH agent pour gérer la clé privée
                sshagent(['ssh-private-key-id']) { // Remplacez par l'ID de l'identifiant SSH de Jenkins
                    script {
                        // Copier les fichiers sur le serveur avec SCP
                        sh 'scp -o StrictHostKeyChecking=no -r ./ cpadmin@172.25.52.205:/home/cpadmin/app/'

                        // Se connecter au serveur et redémarrer l'application
                        sh '''
                        ssh -o StrictHostKeyChecking=no cpadmin@172.25.52.205 << 'EOF'
                          cd /home/cpadmin/app
                          npm install
                          
                          if [ -f ecosystem.config.js ]; then
                            pm2 restart ecosystem.config.js --watch || pm2 start ecosystem.config.js
                            pm2 save
                          else
                            echo "ecosystem.config.js not found, skipping PM2 start."
                          fi
                        EOF
                        '''
                    }
                }
            }
        }
    }

    post {
        always {
            // Nettoyer les clés SSH
            cleanWs()
        }
    }
}
