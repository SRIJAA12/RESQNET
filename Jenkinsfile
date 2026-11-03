pipeline {
    agent any

    environment {
        DOCKER = '/usr/local/bin/docker'
        ANSIBLE_PLAYBOOK = '/usr/bin/ansible-playbook'
        DEPLOY_PLAYBOOK = '/opt/resqnet-ansible/deploy.yml'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/SRIJAA12/RESQNET.git'
            }
        }

     	stage('Backend Tests') {
            steps {
                sh '''
                    ${DOCKER} run --rm \
                      -v "$WORKSPACE/backend:/app" \
                      -w /app \
                      python:3.11-slim \
                      sh -c 'apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y gcc libpq-dev && pip install -r requirements.txt && pytest -q'
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    test -f .env || cp .env.example .env
                    ${DOCKER} compose build backend frontend
                '''
            }
        }

        stage('Deploy with Ansible') {
            steps {
                sh '''
                    ${ANSIBLE_PLAYBOOK} \
                      -i localhost, \
                      -c local \
                      ${DEPLOY_PLAYBOOK}
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    ${DOCKER} compose ps
                    curl --fail --silent --show-error \
                      http://localhost:8001/api/health
                '''
            }
        }
    }

    post {
        success {
            echo 'RESQNET CI/CD pipeline completed successfully.'
        }
        failure {
            echo 'RESQNET CI/CD pipeline failed. Check the stage logs.'
        }
    }
}
