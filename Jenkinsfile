pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        APP_NAME        = 'ecomm-frontend'
        IMAGE_NAME      = 'ecomm-frontend:latest'
        FRONTEND_PORT   = '3000'
        DOCKER_NETWORK  = 'jenkins-mysql_default'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/prem21kumars/e-combackfrontend.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t "$IMAGE_NAME" .'
            }
        }

        stage('Deploy Frontend') {
            steps {
                sh '''
                    docker network inspect "$DOCKER_NETWORK" >/dev/null 2>&1 || docker network create "$DOCKER_NETWORK" || true
                    docker rm -f "$APP_NAME" || true
                    docker run -d \
                        --name "$APP_NAME" \
                        --restart unless-stopped \
                        --network "$DOCKER_NETWORK" \
                        -p "$FRONTEND_PORT:80" \
                        "$IMAGE_NAME"
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    sleep 5
                    docker ps --filter "name=$APP_NAME"
                    docker logs --tail 30 "$APP_NAME"
                '''
            }
        }
    }

    post {
        success {
            echo 'E-Commerce Frontend CI/CD completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check Console Output.'
        }
    }
}
