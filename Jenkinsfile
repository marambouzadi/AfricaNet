pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                sh 'docker build -t africanet_backend:latest .'
            }
        }

        stage('Build Frontend') {
            steps {
                sh 'docker build -t africanet_frontend:latest ./sprint3-frontend'
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker-compose down || true'
                sh 'docker-compose up -d'
            }
        }
    }

    post {
        success {
            echo 'Build et déploiement réussis !'
        }
        failure {
            echo 'Le build a échoué.'
        }
    }
}
