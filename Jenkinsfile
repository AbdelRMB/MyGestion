pipeline {
    agent any

    triggers {
        githubPush()
    }

    environment {
        VITE_API_URL = 'https://apimygestion.abdelrahimriche.com/api'
        NODE_ENV = 'production'
    }

    stages {
        stage('Install dependencies (with dev deps)') {
            steps {
                sh '''
                npm install vite
                '''
            }
        }

        stage('Build application (prod)') {
            steps {
                sh '''
                NODE_ENV=production npm run build
                '''
            }
        }

        stage('Deploy to /var/www/html/mygestion.abdelrahimriche.com/Frontend') {
            steps {
                sh '''
                DEPLOY_DIR="/var/www/html/mygestion.abdelrahimriche.com/Frontend"
                BUILD_DIR="dist"   # si c'est "build" chez toi, change ce nom

                if [ ! -d "$BUILD_DIR" ]; then
                  echo "ERREUR: $BUILD_DIR n'existe pas. Vérifie dist/build."
                  exit 1
                fi

                sudo mkdir -p "$DEPLOY_DIR"
                sudo rm -rf "$DEPLOY_DIR"/*

                sudo cp -r $BUILD_DIR/* "$DEPLOY_DIR"/

                sudo chown -R www-data:www-data "$DEPLOY_DIR"
                '''
            }
        }
    }
}