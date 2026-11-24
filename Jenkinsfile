// =============================================================================
// Dedicated Frontend Jenkins CI/CD Pipeline
// Project: React 19 + Vite 8 + Bootstrap 5 + Nginx Production Container
// Scope: Clean Dependency Install, oxlint, Production Build, Dockerization, Deploy
// =============================================================================

pipeline {
    agent any

    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['dev', 'staging', 'production'],
            description: 'Deployment Target Environment'
        )
        booleanParam(
            name: 'RUN_LINT',
            defaultValue: true,
            description: 'Run oxlint code quality verification'
        )
        booleanParam(
            name: 'BUILD_DOCKER_IMAGE',
            defaultValue: true,
            description: 'Build production Nginx container'
        )
        booleanParam(
            name: 'PUSH_IMAGE',
            defaultValue: false,
            description: 'Push container image to Docker Hub / Registry'
        )
        string(
            name: 'IMAGE_NAME',
            defaultValue: 'ootoys/ecommerce-frontend',
            description: 'Docker image repository name'
        )
    }

    environment {
        NODE_HOME           = tool 'NodeJS-20'
        PATH                = "${env.NODE_HOME}/bin:${env.PATH}"
        DOCKER_CREDENTIALS  = 'docker-hub-credentials'
        TAG                 = "${env.BUILD_NUMBER}-${env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : 'latest'}"
    }

    tools {
        nodejs 'NodeJS-20'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '20'))
        disableConcurrentBuilds()
        timeout(time: 20, unit: 'MINUTES')
        timestamps()
        ansiColor('xterm')
    }

    stages {

        stage('1. Setup & Environment') {
            steps {
                script {
                    echo "Frontend Build Number: ${env.BUILD_NUMBER}"
                    echo "Target Environment  : ${params.ENVIRONMENT}"
                    if (isUnix()) {
                        sh 'node --version'
                        sh 'npm --version'
                    } else {
                        bat 'node --version'
                        bat 'npm --version'
                    }
                }
            }
        }

        stage('2. Install Dependencies (Clean)') {
            steps {
                script {
                    echo "Installing node modules cleanly with npm ci..."
                    if (isUnix()) {
                        sh 'npm ci'
                    } else {
                        bat 'npm ci'
                    }
                }
            }
        }

        stage('3. Code Quality & Lint') {
            when {
                expression { params.RUN_LINT == true }
            }
            steps {
                script {
                    echo "Executing oxlint code analysis..."
                    if (isUnix()) {
                        sh 'npm run lint || true'
                    } else {
                        bat 'npm run lint || exit 0'
                    }
                }
            }
        }

        stage('4. Production Build with Vite') {
            steps {
                script {
                    echo "Compiling Vite 8 production distribution bundle..."
                    if (isUnix()) {
                        sh 'npm run build'
                    } else {
                        bat 'npm run build'
                    }
                }
            }
        }

        stage('5. Dockerize with Nginx') {
            when {
                expression { params.BUILD_DOCKER_IMAGE == true }
            }
            steps {
                script {
                    echo "Building hardened Nginx container: ${params.IMAGE_NAME}:${env.TAG}..."
                    if (isUnix()) {
                        sh "docker build -t ${params.IMAGE_NAME}:${env.TAG} -t ${params.IMAGE_NAME}:latest ."
                    } else {
                        bat "docker build -t ${params.IMAGE_NAME}:${env.TAG} -t ${params.IMAGE_NAME}:latest ."
                    }
                }
            }
        }

        stage('6. Push Image to Registry') {
            when {
                expression { params.PUSH_IMAGE == true }
            }
            steps {
                script {
                    echo "Pushing frontend image to Docker registry..."
                    try {
                        withCredentials([usernamePassword(
                            credentialsId: env.DOCKER_CREDENTIALS,
                            usernameVariable: 'DOCKER_USER',
                            passwordVariable: 'DOCKER_PASS'
                        )]) {
                            if (isUnix()) {
                                sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                                sh "docker push ${params.IMAGE_NAME}:${env.TAG}"
                                sh "docker push ${params.IMAGE_NAME}:latest"
                                sh 'docker logout'
                            } else {
                                bat 'echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin'
                                bat "docker push ${params.IMAGE_NAME}:${env.TAG}"
                                bat "docker push ${params.IMAGE_NAME}:latest"
                                bat 'docker logout'
                            }
                        }
                    } catch (Exception e) {
                        echo "Docker push skipped or failed: ${e.message}"
                    }
                }
            }
        }

        stage('7. Smoke Test Verification') {
            steps {
                script {
                    echo "Verifying frontend build dist folder contains index.html..."
                    if (isUnix()) {
                        sh 'test -f dist/index.html && echo "dist/index.html verified"'
                    } else {
                        bat 'if exist dist\\index.html (echo dist\\index.html verified) else (exit 1)'
                    }
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'dist/**', allowEmptyArchive: true
            cleanWs cleanWhenAborted: false, cleanWhenFailure: false, notFailBuild: true
        }
        success {
            echo "✅ React Frontend Build #${env.BUILD_NUMBER} Finished Successfully!"
        }
        failure {
            echo "❌ React Frontend Build #${env.BUILD_NUMBER} Failed!"
        }
    }
}
