pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend Image') {
            steps {
                sh 'docker build -t africanet_backend:latest .'
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh 'docker build -t africanet_frontend:latest ./frontend'
            }
        }

        stage('Deploy Containers') {
            steps {
                sh 'docker-compose down || true'
                sh 'docker-compose up -d --build'
            }
        }
    }

    post {
        always {
            sh 'docker image prune -f'
        }
        success {
            echo 'Build et déploiement réussis !'
        }
        failure {
            echo 'Le build ou le déploiement a échoué.'
        }
    }
}
